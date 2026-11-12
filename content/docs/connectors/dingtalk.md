---
title: "Authentication Through Dingtalk"
linkTitle: "Dingtalk"
description: ""
date: 2023-04-24
draft: false
toc: true
weight: 2130
---

## Overview

One of the login options for dex uses the Dingtalk OAuth2 flow to identify the end user through their Dingtalk account.

When a client redeems a refresh token through dex, dex will re-query Dingtalk to update user information in the ID Token. To do this, __dex stores a readonly Dingtalk access token in its backing datastore.__ Users that reject dex's access through Dingtalk will also revoke all dex clients which authenticated them through Dingtalk.

## Configuration

Register a new application via [dingtalk open platform](https://open-dev.dingtalk.com/fe/app#/corp/app) ensuring the callback URL is `(dex issuer)/callback`. For example if dex is listening at the non-root path `https://auth.example.com/dex` the callback would be `https://auth.example.com/dex/callback`.

The application requires the user to grant the `Contact.User.mobile` and `Contact.User.Read` scopes. The latter is required only if group membership is a desired claim.

The following is an example of a configuration for `examples/config-dev.yaml`:

```yaml
connectors:
  - type: dingtalk
    # Required field for connector id.
    id: dingtalk
    # Required field for connector name.
    name: dingtalk
    config:
      # Credentials can be string literals or pulled from the environment.
      appId: $DINGTALK_APPLICATION_ID
      appSecret: $DINGTALK_CLIENT_SECRET
      redirectURI: http://127.0.0.1:5556/dex/callback
```