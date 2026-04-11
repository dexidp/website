---
title: "Documentation"
description: "Dex documentation — federated OpenID Connect identity service"
date: 2020-01-07T14:59:38+01:00
draft: false
toc: true
menu: { main: { weight: 10 } }
---

Dex is an identity service that uses OpenID Connect to drive authentication for other apps. It acts as a portal to other identity providers through "connectors" — letting you defer authentication to LDAP, SAML, or established providers like GitHub, Google, and Active Directory.

<div class="doc-cards">
  <a href="/docs/getting-started/" class="doc-card">
    <span class="doc-card-label">// 01 · install</span>
    <h3>Getting Started</h3>
    <p>Install Dex, run it locally, and authenticate your first client in minutes.</p>
  </a>
  <a href="/docs/configuration/" class="doc-card">
    <span class="doc-card-label">// 02 · configure</span>
    <h3>Configuration</h3>
    <p>Storage, OAuth2 clients, tokens, custom scopes and claims — everything you can configure.</p>
  </a>
  <a href="/docs/connectors/" class="doc-card">
    <span class="doc-card-label">// 03 · connect</span>
    <h3>Connectors</h3>
    <p>Wire Dex up to GitHub, Google, LDAP, SAML, OIDC, Microsoft and many more identity providers.</p>
  </a>
  <a href="/docs/guides/" class="doc-card">
    <span class="doc-card-label">// 04 · guides</span>
    <h3>Guides</h3>
    <p>Practical walkthroughs: Kubernetes SSO, kubelogin with Active Directory, token exchange, and more.</p>
  </a>
</div>

## Architecture

<img src="/img/architecture.png" alt="Dex architecture diagram">

## Getting help

* For feature requests and bugs, file an [issue](https://github.com/dexidp/dex/issues).
* For general discussion about using and developing Dex, join the [#dex channel](https://cloud-native.slack.com/archives/C01HF2G1R34) on the CNCF Slack or the [GitHub Discussions](https://github.com/dexidp/dex/discussions) board.

## Reporting a security vulnerability

Due to their public nature, GitHub and mailing lists are NOT appropriate places for reporting vulnerabilities. Please refer to the project's [security disclosure](https://github.com/dexidp/dex/blob/master/.github/SECURITY.md) process when reporting issues that may be security related.
