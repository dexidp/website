---
title: "Home"
---

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/dexidp/dex/CI?style=flat-square)
[![Go Report Card](https://goreportcard.com/badge/github.com/dexidp/dex?style=flat-square)](https://goreportcard.com/report/github.com/dexidp/dex)

Dex is an identity service that uses [OpenID Connect](https://openid.net/connect/) to drive authentication for other apps.

Dex acts as a portal to other identity providers through [“connectors.”](/docs/connectors/) This lets Dex defer authentication to LDAP servers, SAML providers, or established identity providers like GitHub, Google, and Active Directory. Clients write their authentication logic once to talk to Dex, then Dex handles the protocols for a given backend.
