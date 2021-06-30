---
title: "Connectors"
description: ""
date: 2020-01-07T14:59:38+01:00
draft: false
toc: true
weight: 2000
---

When a user logs in through Dex, the user's identity is usually stored in another user-management system: a LDAP directory, a GitHub org, etc. Dex acts as a shim between a client app and the upstream identity provider. The client only needs to understand OpenID Connect to query Dex, while Dex implements an array of protocols for querying other user-management systems.

![](/img/dex-flow.png)

A "connector" is a strategy used by Dex for authenticating a user against another identity provider. Dex implements connectors that target specific platforms such as GitHub, LinkedIn, and Microsoft as well as established protocols like LDAP and SAML.

Depending on the connectors limitations in protocols can prevent Dex from issuing [refresh tokens][scopes] or returning [group membership][scopes] claims. For example, because SAML doesn't provide a non-interactive way to refresh assertions, if a user logs in through the SAML connector Dex won't issue a refresh token to its client. Refresh token support is required for clients that require offline access, such as `kubectl`.

Dex implements the following connectors:

| Name | supports refresh tokens | supports groups claim | supports preferred_username claim | status | notes |
| ---- | ----------------------- | --------------------- | --------------------------------- | ------ | ----- |
| [LDAP](/docs/connectors/ldap/) | yes | yes | yes | stable | |
| [GitHub](/docs/connectors/github/) | yes | yes | yes | stable | |
| [SAML 2.0](/docs/connectors/saml/) | no | yes | no | stable |
| [GitLab](/docs/connectors/gitlab/) | yes | yes | yes | beta | |
| [OpenID Connect](/docs/connectors/oidc/) | yes | yes | yes | beta | Includes Salesforce, Azure, etc. |
| [Google](/docs/connectors/google/) | yes | yes | yes | alpha | |
| [LinkedIn](/docs/connectors/linkedin/) | yes | no | no | beta | |
| [Microsoft](/docs/connectors/microsoft/) | yes | yes | no | beta | |
| [AuthProxy](/docs/connectors/authproxy/) | no | no | no | alpha | Authentication proxies such as Apache2 mod_auth, etc. |
| [Bitbucket Cloud](/docs/connectors/bitbucketcloud/) | yes | yes | no | alpha | |
| [OpenShift](/docs/connectors/openshift/) | no | yes | no | stable | |
| [Atlassian Crowd](/docs/connectors/atlassian-crowd/) | yes | yes | yes * | beta | preferred_username claim must be configured through config |
| [Gitea](/docs/connectors/gitea/) | yes | no | yes | alpha | |
| [OpenStack Keystone](/docs/connectors/keystone/) | yes | yes | no | alpha |  |


Stable, beta, and alpha are defined as:

* Stable: well tested, in active use, and will not change in backward incompatible ways.
* Beta: tested and unlikely to change in backward incompatible ways.
* Alpha: may be untested by core maintainers and is subject to change in backward incompatible ways.

All changes or deprecations of connector features will be announced in the [release notes.][release-notes]

[scopes]: /docs/custom-scopes-claims-clients.md#scopes
[release-notes]: https://github.com/dexidp/dex/releases
