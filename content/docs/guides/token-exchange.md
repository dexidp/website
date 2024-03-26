---
title: "Machine Authentication to Dex"
linkTitle: "Authentication for Machines"
description: ""
date: 2023-07-01
draft: false
toc: true
weight: 1080
---

## Overview

Most Dex connectors redirect users to the upstream identity provider as part of the authentication flow.
While this works for human users,
it is much harder for machines and automated processes (e.g., CI pipelines) to complete this interactive flow.
This is where [OAuth2 Token Exchange][token-exchange] comes in:
it allows clients to exchange an access or ID token they already have
(obtained from their environment, though custom CLI commands, etc.)
for a token issued by dex.

This works like [GCP Workload Identity Federation][gcp-federation] and [AWS Web Identity Federation][aws-federation],
allowing processes running in trusted execution environments that issue OIDC tokens,
such as [Gtihub Actions][gh-actions], [Buildkite][buildkite], [CircleCI][circleci], [GCP][gcp], and others,
to exchange them for a dex issued token to access protected resources.

The authentication flow looks like this:

1. Client independently obtains an access / id token from the upstream IDP.
2. Client exchanges the upstream token for a dex access / id token via the token exchange flow.
3. Use token to access dex protected resources.
4. Repeat these steps when the token expires.

## Configuring dex

Currently, only the [OIDC Connector][oidc-connector] supports token exchanges.
For this flow, `clientID`, `clientSecret`, and `redirectURI` aren't required.
`getUserInfo` is required if you want to exchange from access tokens to dex issued tokens.

As the user performing the token exchange will need the client secret,
we configure the client as a [public client](./custom-scopes-claims-clients.md#public-clients).
If you need to allow humans and machines to authenticate,
consider creating a dedicated public client for token exchange
and using [cross-client trust](./custom-scopes-claims-clients.md#cross-client-trust-and-authorized-party).

```yaml
issuer: https://dex.example.com
storage:
    type: sqlite3
    config:
        file: dex.db
web:
    http: 0.0.0.0:8001

outh2:
  grantTypes:
    # ensure grantTypes includes the token-exchange grant (default)
    - "urn:ietf:params:oauth:grant-type:token-exchange"

connectors:
  - name: My Upstream
    type: oidc
    id: my-upstream
    config:
      # The client submitted subject token will be verified against the issuer given here.
      issuer: https://token.example.com
      # Additional scopes in token response, supported list at:
      # https://dexidp.io/docs/custom-scopes-claims-clients/#scopes
      scopes:
        - groups
        - federated:id
      # mapping of fields from the submitted token
      userNameKey: sub
      # Access tokens are generally considered opaque.
      # We check their validity by calling the user info endpoint if it's supported.
      # getUserInfo: true

staticClients:
  # dex issued tokens are bound to clients.
  # For the token exchange flow, the client id and secret pair must be submitted as the username:password
  # via Basic Authentication.
  - name: My App
    id: my-app
    secret: my-secret
    # We set public to indicate we don't intend to keep the client secret actually secret.
    # https://dexidp.io/docs/custom-scopes-claims-clients/#public-clients
    public: true
```

## Performing a token exchange

To exchange an upstream IDP token for a dex issued token,
perform an `application/x-www-form-urlencoded` `POST` request
to dex's `/token` endpoint following [RFC 8693 Section 2.1][token-exchange-2-1].
Additionally, dex requires the connector to be specified with the `connector_id` parameter
and a client id/secret to be included as the username/password via Basic Authentication.

```sh
$ export UPSTREAM_TOKEN=$(# get a token from the upstream IDP)

$ curl https://dex.example.com/token \
  --user my-app:my-secret \
  --data-urlencode connector_id=my-upstream \
  --data-urlencode grant_type=urn:ietf:params:oauth:grant-type:token-exchange \
  --data-urlencode scope="openid groups federated:id" \
  --data-urlencode requested_token_type=urn:ietf:params:oauth:token-type:access_token \
  --data-urlencode subject_token=$UPSTREAM_TOKEN \
  --data-urlencode subject_token_type=urn:ietf:params:oauth:token-type:access_token
```

Below is an example of a successful response.
Note that regardless of the `requested_token_type`,
the token will always be in the `access_token` field,
with the type indicated by the `issued_token_type` field.
See [RFC 8693 Section 2.2.1][token-exchange-2-2-1] for details.

```json
{
  "access_token":"eyJhbGciOi....aU5oA",
  "issued_token_type":"urn:ietf:params:oauth:token-type:access_token",
  "token_type":"bearer",
  "expires_in":86399
}
```

### Full example with GitHub Actions

Here is an example of running dex as a service during a Github Actions workflow
and getting an access token from it, exchanged from a Github Actions OIDC token.

Dex config:

```yaml
issuer: http://127.0.0.1:5556/
storage:
  type: sqlite3
  config:
    file: dex.db
web:
  http: 0.0.0.0:8080
connectors:
- type: oidc
  id: github-actions
  name: github-actions
  config:
    issuer: https://token.actions.githubusercontent.com
    scopes:
      - openid
      - groups
    userNameKey: sub
staticClients:
  - name: My app
    id: my-app
    secret: my-secret
    public: true
```

Github actions workflow.
Replace the service image with one that has the config included.

```yaml
name: workflow1

on: [push]

permissions:
  id-token: write # This is required for requesting the JWT

jobs:
  job:
    runs-on: ubuntu-latest
    services:
      dex:
        # replace with an image that has the config above
        image: ghcr.io/dexidp/dex:latest
        ports:
          - 80:8080
    steps:
      # Actions have access to two special environment variables ACTIONS_CACHE_URL and ACTIONS_RUNTIME_TOKEN.
      # Inline step scripts in workflows do not see these variables.
      - uses: actions/github-script@v6
        id: script
        timeout-minutes: 10
        with:
          debug: true
          script: |
            const token = process.env['ACTIONS_RUNTIME_TOKEN']
            const runtimeUrl = process.env['ACTIONS_ID_TOKEN_REQUEST_URL']
            core.setOutput('TOKEN', token.trim())
            core.setOutput('IDTOKENURL', runtimeUrl.trim())
      - run: |
          # get an token from github
          GH_TOKEN_RESPONSE=$(curl \
            "${{steps.script.outputs.IDTOKENURL}}" \
            -H "Authorization: bearer  ${{steps.script.outputs.TOKEN}}" \
            -H "Accept: application/json; api-version=2.0" \
            -H "Content-Type: application/json" \
            -d "{}" \
          )
          GH_TOKEN=$(jq -r .value <<< $GH_TOKEN_RESPONSE)

          # exchange it for a dex token
          DEX_TOKEN_RESPONSE=$(curl \
              http://127.0.0.1/token \
              --user my-app:my-secret \
              --data-urlencode "connector_id=github-actions" \
              --data-urlencode "grant_type=urn:ietf:params:oauth:grant-type:token-exchange" \
              --data-urlencode "scope=openid groups federated:id" \
              --data-urlencode "requested_token_type=urn:ietf:params:oauth:token-type:access_token" \
              --data-urlencode "subject_token=$GH_TOKEN" \
              --data-urlencode "subject_token_type=urn:ietf:params:oauth:token-type:access_token")
          DEX_TOKEN=$(jq -r .access_token <<< $DEX_TOKEN_RESPONSE)

          # use $DEX_TOKEN

        id: idtoken
```

[token-exchange]: https://www.rfc-editor.org/rfc/rfc8693.html
[token-exchange-2-1]: https://www.rfc-editor.org/rfc/rfc8693.html#name-request
[token-exchange-2-2-1]: https://www.rfc-editor.org/rfc/rfc8693.html#name-successful-response
[gcp-federation]: https://cloud.google.com/iam/docs/workload-identity-federation
[aws-federation]: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_oidc.html
[gh-actions]: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect
[buildkite]: https://badge.buildkite.com/docs/agent/v3/cli-oidc
[circleci]: https://circleci.com/docs/openid-connect-tokens/
[gcp]: https://cloud.google.com/sdk/gcloud/reference/auth/print-access-token
[oidc-connector]: https://dexidp.io/docs/connectors/oidc/
