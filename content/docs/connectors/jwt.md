---
title: "Authentication Through an Upstream JWT"
linkTitle: "JWT"
description: ""
date: 2026-09-22
draft: false
toc: true
weight: 2095
---

NOTE: This connector is experimental and may change in the future.

## Overview

The `jwt` connector returns identities based on a JWT bearer token that an
upstream proxy, gateway or service mesh places on the request. Unlike the
[authproxy](/docs/connectors/authproxy/) connector, which trusts plain headers,
the `jwt` connector verifies the token's signature against the upstream
provider's JWKS and always enforces the expected issuer. Unlike the
[OpenID Connect](/docs/connectors/oidc/) connector, it performs no redirect to
the upstream provider: the token must already be present on the request.

This is useful when the upstream infrastructure has already authenticated the
user and holds a signed token for them, but you still want Dex to validate that
token rather than take a header at face value.

The connector does not support refresh tokens, and it does not support the token
exchange grant.

## How the flow works

Like the authproxy connector, the `jwt` connector sends the user straight to its
own callback URL:

```
( dex issuer URL )/callback/( connector id )?( url query )
```

For example, if Dex runs at `https://auth.example.com/dex` and the connector ID
is `jwt`, the callback URL looks like:

```
https://auth.example.com/dex/callback/jwt?state=xdg3z6quhrhwaueo5iysvliqf
```

The proxy must set the configured header on requests to that callback path.
Dex then verifies the token, maps its claims and issues its own ID token.

## Configuration

```yaml
connectors:
- type: jwt
  id: jwt
  name: Upstream JWT
  config:
    # The expected "iss" claim. Required, and always enforced.
    issuer: https://idp.example.com

    # Optional. Overrides key retrieval only: when set, Dex fetches the signing
    # keys from this URL instead of discovering them through the issuer's
    # .well-known/openid-configuration document. Issuer validation is performed
    # either way. Required when the issuer is not a URL serving OIDC discovery.
    jwksURL: https://idp.example.com/keys

    # Optional. A token is accepted when at least one of its audiences matches.
    # When omitted, the "aud" claim is not checked.
    audiences:
    - argocd

    # Optional. Defaults to RS256.
    supportedSigningAlgs:
    - RS256

    # Optional. The header carrying the token. Defaults to Authorization.
    # An optional "Bearer " prefix is stripped case-insensitively.
    header: Authorization

    # Optional. Certificates used when fetching the JWKS.
    rootCAs:
    - /etc/dex/idp-ca.pem
    insecureSkipVerify: false
```

The `exp` and `nbf` claims are validated together with the signature, so expired
or not-yet-valid tokens are rejected (`nbf` with five minutes of leeway for
clock skew).

Without `jwksURL`, Dex performs OIDC discovery on the issuer when the connector
is opened, at startup. The issuer must then be a URL that serves
`.well-known/openid-configuration` and is reachable from Dex at that moment.
Upstreams whose `iss` is not a URL, or that publish only a JWKS, need
`jwksURL`. With `jwksURL` set, keys are fetched on the first login and
refreshed when a token carries an unknown key ID.

### Claim mapping

Claim mapping mirrors the OpenID Connect connector, so configuration can be
moved between the two connectors:

```yaml
config:
  issuer: https://idp.example.com

  # Claim used as the user ID. Defaults to "sub".
  userIDKey: sub

  # Claim used as the username. Defaults to "name".
  userNameKey: name

  # Override the value of email_verified to true in the returned claims.
  insecureSkipEmailVerified: false

  claimMapping:
    preferred_username: preferred_username
    email: email
    groups: groups

  claimModifications:
    # Keep only the groups matching this regular expression.
    filterGroupClaims:
      groupsFilter: '^argocd-.*$'

    # Add a prefix and/or suffix to every group taken from the groups claim.
    modifyGroupNames:
      prefix: "upstream:"
      suffix: ""

    # Join several claims into an additional group.
    newGroupFromClaims:
    - claims:
      - organization
      - team
      delimiter: ":"
      clearDelimiter: false
      prefix: org

  # Only allow users holding at least one of these groups in the groups
  # claim. The identity's groups are reduced to the matching set.
  allowedGroups:
  - argocd-admins
```

Groups are processed in this order:

1. the groups claim is read;
2. `filterGroupClaims` keeps only the matching groups;
3. `allowedGroups` rejects the login if none of the remaining groups match, and
   otherwise reduces them to the matching set;
4. `modifyGroupNames` adds the prefix and suffix;
5. groups from `newGroupFromClaims` and `roleMapping` are appended.

Groups from step 5 are not filtered, checked against `allowedGroups` or renamed.
In particular, `allowedGroups` only considers the groups claim: a user who
would qualify only through a `roleMapping` group is still rejected.

The groups claim may be either a single string or an array of strings. An array
of objects with a `name` field is also accepted.

If the token carries an email but no `email_verified` claim, the login is
rejected unless `insecureSkipEmailVerified` is set.

### Mapping claims to roles

`roleMapping` binds the values of an arbitrary claim to additional groups. Each
rule names a `claim` and matches it with either `value` (exact) or `valueRegex`;
the two are mutually exclusive. When a rule matches, its `groups` are added to
the identity:

```yaml
config:
  issuer: https://idp.example.com
  roleMapping:
  - claim: department
    value: platform
    groups:
    - argocd-admins
  - claim: roles
    valueRegex: '^sre-.*$'
    groups:
    - argocd-sre
```

The claim inspected by a rule may hold a single string or an array of strings.
Groups added through `roleMapping` are **not** affected by `filterGroupClaims`,
`allowedGroups` or `modifyGroupNames`, so the names you write here are the names
that reach the downstream application unchanged. The resulting group list is
de-duplicated.

Because `filterGroupClaims` does not apply to them, the two combine well: a
filter that matches nothing, such as `groupsFilter: '^$'`, drops every
upstream group, leaving only the groups `roleMapping` grants. This keeps an
upstream role that happens to share a name with a downstream group from
granting access by accident.

Invalid rules (missing `claim`, no matcher, both matchers, or an invalid
regular expression) are rejected when Dex starts.

## Example: Argo CD

Argo CD resolves RBAC subjects from the ID token Dex issues. Since Argo CD 3.0
the subject is taken from `federated_claims.user_id` (the connector's user ID,
falling back to `sub`); earlier versions use `sub`. Group memberships are read
from the claims listed in `scopes` in `argocd-rbac-cm`, which defaults to
`groups`.

That means a `roleMapping` group name can be referenced directly from the Argo
CD policy. With this connector config:

```yaml
connectors:
- type: jwt
  id: jwt
  name: Upstream JWT
  config:
    issuer: https://idp.example.com
    audiences:
    - argocd
    header: X-Access-Token
    roleMapping:
    - claim: department
      value: platform
      groups:
      - argocd-admins
```

the matching Argo CD policy is:

```yaml
# argocd-rbac-cm
policy.csv: |
  g, argocd-admins, role:admin
```

When Dex runs as Argo CD's bundled Dex, it is served by `argocd-server` under
`/api/dex`, so the callback is `/api/dex/callback/jwt`. The gateway sits in
front of `argocd-server`, which passes the header on to Dex: the gateway must
set `X-Access-Token` to the upstream JWT on requests to that path, or simply on
every request to Argo CD.

## Example: Teleport application access

[Teleport](https://goteleport.com/docs/enroll-resources/application-access/jwt/introduction/)
adds a signed JWT in the `Teleport-Jwt-Assertion` header to every request it
proxies to an application. Its `iss` claim is the Teleport cluster name, not a
URL, so `jwksURL` must point at the proxy's JWKS endpoint. Its `aud` claim is
the application's `uri` as configured in Teleport (the address Teleport
forwards to), not its public address. The user is in `sub` and `username`, and
the user's Teleport roles in `roles`; there is no email claim.

```yaml
connectors:
- type: jwt
  id: teleport
  name: Teleport
  config:
    issuer: teleport.example.com
    jwksURL: https://teleport.example.com/.well-known/jwks.json
    audiences:
    - http://argocd-server.argocd.svc.cluster.local
    header: Teleport-Jwt-Assertion
    userIDKey: sub
    userNameKey: username
    claimMapping:
      preferred_username: username
      groups: roles
    roleMapping:
    - claim: roles
      value: admin
      groups:
      - argocd-admins
```

Publish Argo CD as a Teleport application with that `uri`; since every
request carries the header, the login completes without further prompts.

## Security considerations

- The token's signature, issuer, expiry and not-before time are always verified.
  There is no option to skip issuer validation: a token from an unexpected
  issuer is always rejected, including when `jwksURL` is set.
- Set `audiences`. Without it, any token the issuer signs is accepted,
  including tokens minted for other services, which can then be replayed
  against Dex.
- A token is a bearer credential until it expires: anyone who captures one can
  log in with it until `exp`. Keep Dex reachable only through the proxy that
  adds the token, and prefer upstreams that issue short-lived tokens.
- Prefer a dedicated header over `Authorization` when the proxy already uses
  `Authorization` for its own credentials.
