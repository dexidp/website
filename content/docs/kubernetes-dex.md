---
title: "Kubernetes + Dex"
description: ""
date: 2020-10-21
draft: false
toc: true
weight: 15
---

Dex's main production use is as an auth-N addon in CoreOS's enterprise Kubernetes solution, [Tectonic.][tectonic] Dex runs natively on top of any Kubernetes cluster using Third Party Resources and can drive API server authentication through the OpenID Connect plugin. Clients, such as the [Tectonic Console][tectonic-console] and `kubectl`, can act on behalf users who can login to the cluster through any identity provider Dex supports.

More docs for running Dex as a Kubernetes authenticator can be found [here.](https://dexidp.io/docs/kubernetes/)

[tectonic]: https://tectonic.com/
[tectonic-console]: https://tectonic.com/enterprise/docs/latest/usage/index.html#tectonic-console
