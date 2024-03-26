---
title: "Documentation"
description: ""
date: 2020-01-07T14:59:38+01:00
draft: false
toc: true
menu: { main: { weight: 10 } }
---

## Architecture

Dex is an identity service that uses OpenID Connect to drive authentication for other apps. Dex acts as a portal to other identity providers through "connectors." This lets Dex defer authentication to LDAP servers, SAML providers, or established identity providers like GitHub, Google, and Active Directory.

<img src="/img/architecture.png">

## Getting help

* For feature requests and bugs, file an [issue.](https://github.com/dexidp/dex/issues)
* For general discussion about both using and developing Dex, you can join the [#dexidp channel](slack://channel?team=T09NY5SBT&id=C011URMR41W)
on the Kubernetes Slack, or join the [Dex-dev](https://groups.google.com/forum/#!forum/dex-dev) mailing list.

## Reporting a security vulnerability

Due to their public nature, GitHub and mailing lists are NOT appropriate places for reporting vulnerabilities. Please refer to CoreOS's [security disclosure](https://coreos.com/security/disclosure/) process when reporting issues that may be security related.

