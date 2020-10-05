---
title: "Home"
---

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/dexidp/dex/CI?style=flat-square)
[![Go Report Card](https://goreportcard.com/badge/github.com/dexidp/dex?style=flat-square)](https://goreportcard.com/report/github.com/dexidp/dex)
[![go.dev reference](https://img.shields.io/badge/go.dev-reference-007d9c?logo=go&logoColor=white&style=flat-square)](https://pkg.go.dev/mod/github.com/dexidp/dex)

Dex is an identity service that uses [OpenID Connect][openid-connect] to drive authentication for other apps.

Dex acts as a portal to other identity providers through ["connectors."](#connectors) This lets Dex defer authentication to LDAP servers, SAML providers, or established identity providers like GitHub, Google, and Active Directory. Clients write their authentication logic once to talk to Dex, then Dex handles the protocols for a given backend.

## ID Tokens

ID Tokens are an OAuth2 extension introduced by OpenID Connect and Dex's primary feature. ID Tokens are [JSON Web Tokens][jwt-io] (JWTs) signed by Dex and returned as part of the OAuth2 response that attest to the end user's identity. An example JWT might look like:

```
eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkNDQ3NDFmNzczYjkzOGNmNjVkZDMyNjY4NWI4NjE4MGMzMjRkOTkifQ.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU1NTYvZGV4Iiwic3ViIjoiQ2djeU16UXlOelE1RWdabmFYUm9kV0kiLCJhdWQiOiJleGFtcGxlLWFwcCIsImV4cCI6MTQ5Mjg4MjA0MiwiaWF0IjoxNDkyNzk1NjQyLCJhdF9oYXNoIjoiYmk5NmdPWFpTaHZsV1l0YWw5RXFpdyIsImVtYWlsIjoiZXJpYy5jaGlhbmdAY29yZW9zLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJncm91cHMiOlsiYWRtaW5zIiwiZGV2ZWxvcGVycyJdLCJuYW1lIjoiRXJpYyBDaGlhbmcifQ.OhROPq_0eP-zsQRjg87KZ4wGkjiQGnTi5QuG877AdJDb3R2ZCOk2Vkf5SdP8cPyb3VMqL32G4hLDayniiv8f1_ZXAde0sKrayfQ10XAXFgZl_P1yilkLdknxn6nbhDRVllpWcB12ki9vmAxklAr0B1C4kr5nI3-BZLrFcUR5sQbxwJj4oW1OuG6jJCNGHXGNTBTNEaM28eD-9nhfBeuBTzzO7BKwPsojjj4C9ogU4JQhGvm_l4yfVi0boSx8c0FX3JsiB0yLa1ZdJVWVl9m90XmbWRSD85pNDQHcWZP9hR6CMgbvGkZsgjG32qeRwUL_eNkNowSBNWLrGNPoON1gMg
```

ID Tokens contains standard claims assert which client app logged the user in, when the token expires, and the identity of the user.

```json
{
  "iss": "http://127.0.0.1:5556/dex",
  "sub": "CgcyMzQyNzQ5EgZnaXRodWI",
  "aud": "example-app",
  "exp": 1492882042,
  "iat": 1492795642,
  "at_hash": "bi96gOXZShvlWYtal9Eqiw",
  "email": "jane.doe@coreos.com",
  "email_verified": true,
  "groups": [
    "admins",
    "developers"
  ],
  "name": "Jane Doe"
}
```

Because these tokens are signed by Dex and [contain standard-based claims][standard-claims] other services can consume them as service-to-service credentials. Systems that can already consume OpenID Connect ID Tokens issued by Dex include:

* [Kubernetes][kubernetes]
* [AWS STS][aws-sts]

For details on how to request or validate an ID Token, see [_"Writing apps that use Dex"_][using-dex].

## Kubernetes + Dex

Dex's main production use is as an auth-N addon in CoreOS's enterprise Kubernetes solution, [Tectonic][tectonic]. Dex runs natively on top of any Kubernetes cluster using Third Party Resources and can drive API server authentication through the OpenID Connect plugin. Clients, such as the [Tectonic Console][tectonic-console] and `kubectl`, can act on behalf users who can login to the cluster through any identity provider Dex supports.

More docs for running Dex as a Kubernetes authenticator can be found [here](https://dexidp.io/docs/kubernetes/).

## Connectors

When a user logs in through Dex, the user's identity is usually stored in another user-management system: a LDAP directory, a GitHub org, etc. Dex acts as a shim between a client app and the upstream identity provider. The client only needs to understand OpenID Connect to query Dex, while Dex implements an array of protocols for querying other user-management systems.

![](img/dex-flow.png)

A "connector" is a strategy used by Dex for authenticating a user against another identity provider. Dex implements connectors that target specific platforms such as GitHub, LinkedIn, and Microsoft as well as established protocols like LDAP and SAML.

Depending on the connectors limitations in protocols can prevent Dex from issuing [refresh tokens][scopes] or returning [group membership][scopes] claims. For example, because SAML doesn't provide a non-interactive way to refresh assertions, if a user logs in through the SAML connector Dex won't issue a refresh token to its client. Refresh token support is required for clients that require offline access, such as `kubectl`.

Dex implements the following connectors:

| Name | supports refresh tokens | supports groups claim | supports preferred_username claim | status | notes |
| ---- | ----------------------- | --------------------- | --------------------------------- | ------ | ----- |
| [LDAP](docs/connectors/ldap/) | yes | yes | yes | stable | |
| [GitHub](docs/connectors/github/) | yes | yes | yes | stable | |
| [SAML 2.0](docs/connectors/saml/) | no | yes | no | stable |
| [GitLab](docs/connectors/gitlab/) | yes | yes | yes | beta | |
| [OpenID Connect](docs/connectors/oidc/) | yes | yes | yes | beta | Includes Salesforce, Azure, etc. |
| [Google](docs/connectors/google/) | yes | yes | yes | alpha | |
| [LinkedIn](docs/connectors/linkedin/) | yes | no | no | beta | |
| [Microsoft](docs/connectors/microsoft/) | yes | yes | no | beta | |
| [AuthProxy](docs/connectors/authproxy/) | no | no | no | alpha | Authentication proxies such as Apache2 mod_auth, etc. |
| [Bitbucket Cloud](docs/connectors/bitbucketcloud/) | yes | yes | no | alpha | |
| [OpenShift](docs/connectors/openshift/) | no | yes | no | stable | |
| [Atlassian Crowd](docs/connectors/atlassian-crowd/) | yes | yes | yes * | beta | preferred_username claim must be configured through config |
| [Gitea](docs/connectors/gitea/) | yes | no | yes | alpha | |

Stable, beta, and alpha are defined as:

* Stable: well tested, in active use, and will not change in backward incompatible ways.
* Beta: tested and unlikely to change in backward incompatible ways.
* Alpha: may be untested by core maintainers and is subject to change in backward incompatible ways.

All changes or deprecations of connector features will be announced in the [release notes][release-notes].

## Documentation

* [Getting started](docs/getting-started/)
* [Intro to OpenID Connect](docs/openid-connect/)
* [Writing apps that use Dex][using-dex]
* [What's new in v2](docs/v2/)
* [Custom scopes, claims, and client features](docs/custom-scopes-claims-clients/)
* [Storage options](docs/storage/)
* [gRPC API](docs/api/)
* [Using Kubernetes with Dex](docs/kubernetes/)
* Client libraries
  * [Go][go-oidc]

## Reporting a security vulnerability

Due to their public nature, GitHub and mailing lists are NOT appropriate places for reporting vulnerabilities. Please refer to CoreOS's [security disclosure][disclosure] process when reporting issues that may be security related.

## Getting help

* For feature requests and bugs, file an [issue][issues].
* For general discussion about both using and developing Dex, you can join the [#dexidp channel][slack]
on the Kubernetes Slack, or join the [Dex-dev][dex-dev] mailing list.

[openid-connect]: https://openid.net/connect/
[standard-claims]: https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
[scopes]: Documentation/custom-scopes-claims-clients.md#scopes
[using-dex]: Documentation/using-dex.md
[jwt-io]: https://jwt.io/
[kubernetes]: http://kubernetes.io/docs/admin/authentication/#openid-connect-tokens
[aws-sts]: https://docs.aws.amazon.com/STS/latest/APIReference/Welcome.html
[tectonic]: https://tectonic.com/
[tectonic-console]: https://tectonic.com/enterprise/docs/latest/usage/index.html#tectonic-console
[go-oidc]: https://github.com/coreos/go-oidc
[issue-1065]: https://github.com/dexidp/dex/issues/1065
[release-notes]: https://github.com/dexidp/dex/releases
[issues]: https://github.com/dexidp/dex/issues
[dex-dev]: https://groups.google.com/forum/#!forum/dex-dev
[slack]: slack://channel?team=T09NY5SBT&id=C011URMR41W
[disclosure]: https://coreos.com/security/disclosure/
