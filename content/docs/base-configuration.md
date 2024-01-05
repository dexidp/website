---
title: "Base Configuration"
description: ""
date: 2024-01-05
draft: false
toc: true
weight: 1040
---

# Base Configuration
Dex provides a range of configurable options that empower you to fine-tune and personalize various aspects of identity management and authentication.

## Token Expiration
With Dex, you can precisely control the lifespan of different tokens:


```yaml
expiry:
  deviceRequests: "5m"
  signingKeys: "6h"
  idTokens: "24h"
  refreshTokens:
    disableRotation: false
    reuseInterval: "3s"
    validIfNotUsedFor: "2160h"   # (90 days)
    absoluteLifetime: "3960h"    # (165 days)
```

* `deviceRequests`: duration for device requests token.
* `signingKeys`: expiration time for signing keys.
* `idTokens`: expiration time for ID tokens.
* `refreshTokens`: Configures the refresh token behavior, including rotation, reuse intervals, and absolute lifetimes.
  * `disableRotation`: whether refresh token rotation should be disabled
  * `reuseInterval`: time interval before a refresh token can be reused
  * `validIfNotUsedFor`: validity of a refresh token if not used for a certain duration
  * `absoluteLifetime`: absolute lifetime of refresh tokens


## OAuth2 Flow Customization
Customize OAuth2 settings to align with your authentication requirements:

```yaml
oauth2:
  responseTypes: [ "code" ]
  skipApprovalScreen: true
  alwaysShowLoginScreen: false
  passwordConnector: local
```

* `responseTypes`: enables specific response types (e.g., `"code"`, `"token"`, `"id_token"`) for OAuth2 flow. Use `["code", "token", "id_token"]` to enable implicit flow for web-only clients
* `skipApprovalScreen`: controls the need for user approval before sharing data with connected applications.
* `alwaysShowLoginScreen`: Whether to always display the login screen. If only one authentication method is enabled, the default behavior is to go directly to it. For connected IdPs, this redirects the browser away from application to upstream provider such as the Google login page
* `passwordConnector`: specifies the connector that is used for password grants
