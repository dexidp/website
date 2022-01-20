---
title: "OpenID Connect Provider Certification"
description: ""
date: 2020-09-30
draft: false
toc: true
weight: 1100
---

The OpenID Foundation provides a set of [conformance test profiles](https://openid.net/wordpress-content/uploads/2018/06/OpenID-Connect-Conformance-Profiles.pdf) that test both Relying Party (RP)
and OpenID Provider (OP) OpenID Connect implementations.
Upon submission of [results](https://openid.net/certification/submission/) and an affirmative response,
the affirmed OP will be listed as a [certified OP](https://openid.net/developers/certified/) on the OpenID Connect website
and allowed to use the [certification mark](https://openid.net/certification/mark/) according to the certification [terms and conditions](https://openid.net/wordpress-content/uploads/2015/03/OpenID-Certification-Terms-and-Conditions.pdf), section 3(d).

Further details about the certification are available on the [OpenID Connect website](https://openid.net/certification/instructions/).

## Basic OpenID Provider profile

Dex is an OP that strives to implement the [mandatory set](https://openid.net/specs/openid-connect-core-1_0.html#ServerMTI) of OpenID Connect features,
and can be tested against the Basic OpenID Provider profile ([profile outline](https://openid.net/wordpress-content/uploads/2018/06/OpenID-Connect-Conformance-Profiles.pdf), section 2.1.1).
These tests ensure that all features required by a [basic client](https://openid.net/specs/openid-connect-basic-1_0.html) work as expected.

Unfortunately, Dex currently does not fully comply with the Basic profile at the moment.

The progress for getting Dex certified can be tracked here: https://github.com/orgs/dexidp/projects/3/views/1

### Configuring Dex

The Basic OP test suite doesn't require extensive configuration from Dex.
The suite needs the following:

- A public issuer URL
- At least two separate clients (with redirect URIs pointing to `https://www.certification.openid.net/test/a/YOUR_ALIAS/callback`).

`YOUR_ALIAS` is an arbitrary string that MUST be unique to avoid interference with other test runs.

The easiest way to run a public Dex instance is running one locally and exposing it using a [tunnel](https://github.com/anderspitman/awesome-tunneling).
[Ngrok](https://ngrok.com/) is probably the most popular one. Personally, I prefer using [tunnelto.dev](https://tunnelto.dev/) these days.
Alternatively, you can install Dex on an EC2 instance, a DigitalOcean droplet, or anything publicly available.

Here is a minimal configuration example for running Dex:

```yaml
issuer: https://dex.tunnelto.dev/dex

storage:
  type: memory

web:
  http: 0.0.0.0:5556

oauth2:
  # Automate some clicking
  # Note: this might actually make some tests pass that otherwise wouldn't.
  skipApprovalScreen: true

connectors:
  # Note: this might actually make some tests pass that otherwise wouldn't.
  - type: mockCallback
    id: mock
    name: Example

# Basic OP test suite requires two clients.
staticClients:
  - id: first_client
    secret: 89d6205220381728e85c4cf5
    redirectURIs:
      - https://www.certification.openid.net/test/a/dex/callback
    name: First client

  - id: second_client
    secret: 51c612288018fd384b05d6ad
    redirectURIs:
      - https://www.certification.openid.net/test/a/dex/callback
    name: Second client
```

Save it in a file (eg. `config.yaml`) then launch Dex:

```shell
dex serve config.yaml
```

Then launch the tunnel:

```shell
tunnelto --subdomain dex --port 5556
```

You can verify Dex running by checking the discovery endpoint:

```shell
curl https://dex.tunnelto.dev/dex/.well-known/openid-configuration
```

### Running tests

1. Open https://www.certification.openid.net/ in your browser
1. Login with your Google or Gitlab account
1. Click _Create a new test plan_
1. Select _OpenID Connect Core: Basic Certification Profile Authorization server test_ as the test plan
1. _Server metadata location_ should be **discovery**
1. _Client registration type_ should be **static_client**
1. Choose an alias (that you used in the redirect URIs above)
1. Enter the discovery URL
1. Enter the first client details in the _Client_ and _Second client_ sections
1. Enter the second client details in the _Client for client_secret_post_ section
1. Hit _Create test plan_
1. Run through each test case, following all instructions given by individual cases.
    * In order to pass certain cases, screenshots of OP responses might be required.

### Last results

Dex does not fully pass the Basic profile test suite yet. The following table contains the current state of test results.

| Test Name                                                                    | Status      | Result  |
|------------------------------------------------------------------------------|-------------|---------|
| oidcc-server                                                                 | FINISHED    | PASSED  |
| oidcc-response-type-missing                                                  | FINISHED    | PASSED  |
| oidcc-userinfo-get                                                           | FINISHED    | PASSED  |
| oidcc-userinfo-post-header                                                   | FINISHED    | PASSED  |
| oidcc-userinfo-post-body                                                     | FINISHED    | WARNING |
| oidcc-ensure-request-without-nonce-succeeds-for-code-flow                    | FINISHED    | PASSED  |
| oidcc-scope-profile                                                          | FINISHED    | WARNING |
| oidcc-scope-email                                                            | FINISHED    | WARNING |
| oidcc-scope-address                                                          | FINISHED    | SKIPPED |
| oidcc-scope-phone                                                            | FINISHED    | SKIPPED |
| oidcc-scope-all                                                              | FINISHED    | SKIPPED |
| oidcc-ensure-other-scope-order-succeeds                                      | FINISHED    | WARNING |
| oidcc-display-page                                                           | FINISHED    | PASSED  |
| oidcc-display-popup                                                          | FINISHED    | PASSED  |
| oidcc-prompt-login                                                           | INTERRUPTED | UNKNOWN |
| oidcc-prompt-none-not-logged-in                                              | FINISHED    | FAILED  |
| oidcc-prompt-none-logged-in                                                  | FINISHED    | PASSED  |
| oidcc-max-age-1                                                              | INTERRUPTED | FAILED  |
| oidcc-max-age-10000                                                          | FINISHED    | FAILED  |
| oidcc-ensure-request-with-unknown-parameter-succeeds                         | FINISHED    | PASSED  |
| oidcc-id-token-hint                                                          | FINISHED    | PASSED  |
| oidcc-login-hint                                                             | FINISHED    | PASSED  |
| oidcc-ui-locales                                                             | FINISHED    | PASSED  |
| oidcc-claims-locales                                                         | FINISHED    | PASSED  |
| oidcc-ensure-request-with-acr-values-succeeds                                | FINISHED    | WARNING |
| oidcc-codereuse                                                              | FINISHED    | PASSED  |
| oidcc-codereuse-30seconds                                                    | FINISHED    | WARNING |
| oidcc-ensure-registered-redirect-uri                                         | INTERRUPTED | REVIEW  |
| oidcc-server-client-secret-post                                              | FINISHED    | PASSED  |
| oidcc-unsigned-request-object-supported-correctly-or-rejected-as-unsupported | INTERRUPTED | UNKNOWN |
| oidcc-claims-essential                                                       | FINISHED    | WARNING |
| oidcc-ensure-request-object-with-redirect-uri                                | INTERRUPTED | UNKNOWN |
| oidcc-refresh-token                                                          | INTERRUPTED | FAILED  |
| oidcc-ensure-request-with-valid-pkce-succeeds                                | FINISHED    | PASSED  |

> TODO: find a better place for test results.
