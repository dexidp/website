---
title: "Authentication Through Gitea"
linkTitle: "Gitea"
description: ""
date: 2020-09-30
draft: false
toc: true
weight: 2130
---

## Overview

One of the login options for dex uses the Gitea OAuth2 flow to identify the end user through their Gitea account.

When a client redeems a refresh token through dex, dex will re-query Gitea to update user information in the ID Token. To do this, __dex stores a readonly Gitea access token in its backing datastore.__ Users that reject dex's access through Gitea will also revoke all dex clients which authenticated them through Gitea. Does also support [Forgejo](https://forgejo.org/).

## Configuration

Register a new OAuth consumer with [Gitea](https://docs.gitea.com/next/development/oauth2-provider) ensuring the callback URL is `(dex issuer)/callback`. For example if dex is listening at the non-root path `https://auth.example.com/dex` the callback would be `https://auth.example.com/dex/callback`.

The following is an example of a configuration for `examples/config-dev.yaml`:

```yaml
connectors:
- type: gitea
  # Required field for connector id.
  id: gitea
  # Required field for connector name.
  name: Gitea
  config:
    # Credentials can be string literals or pulled from the environment.
    clientID: $GITEA_CLIENT_ID
    clientSecret: $GITEA_CLIENT_SECRET
    redirectURI: http://127.0.0.1:5556/dex/callback
    # optional, default = https://gitea.com
    baseURL: https://gitea.com
    # Includes all gittea groups as groups claim (OrgaName, OrgaName:TeamName) (disabled if orgs is defined)
    loadAllGroups: true 

    #orgs:
    # # Organization name in gitea (not slug, full name). Only users in this gitea organization can authenticate.
    # - name: OrgaName
    # Names of teams in a gitea organization. A user will be able to authenticate if they are members of at least one of these teams. Users in the organization can authenticate if this field is omitted from the config file.
    #   teams:
    #   - TeamName1 
    #   - TeamName2
```
