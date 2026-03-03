---
title: "OAuth2"
description: "OAuth2 flow customization options"
date: 2024-01-05
draft: false
toc: true
weight: 1060
---
Dex provides a range of configurable options that empower you to fine-tune and personalize various aspects of the authentication and user flow.

## Flow Customization
Customize OAuth2 settings to align with your authentication requirements.

```yaml
oauth2:
  grantTypes: [ "authorization_code" ]
  responseTypes: [ "code" ]
  skipApprovalScreen: true
  alwaysShowLoginScreen: false
```

### Authentication flow
* `responseTypes` - allows you to configure the desired auth flow (`Authorization Code Flow`, `Implicit Flow`, or `Hybrid Flow`) based on different values. See the table below for valid configuration options.

| `responseTypes` value  | flow                    |
|------------------------|-------------------------|
| `code`                 | Authorization Code Flow |
| `id_token`             | Implicit Flow           |
| `id_token token`       | Implicit Flow           |
| `code id_token`        | Hybrid Flow             |
| `code token`           | Hybrid Flow             |
| `code id_token token`  | Hybrid Flow             |
Examples of the different flows and their behavior can be found in the [official openid spec](https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationExamples).

### User flow

Customizing the user flow allows you to influence how users login into your application.

* `skipApprovalScreen` - controls the need for user approval before sharing data with connected applications. If enabled, users must approve data sharing with every auth flow.
  {{% alert color="info" %}}
  This setting is not applicable when the request has the `approval_prompt=force` parameter. In this case, the approval screen is always shown.
  {{% /alert %}}
* `alwaysShowLoginScreen` - whether to always display the login screen. If only one authentication method is enabled, the default behavior is to go directly to it. For connected IdPs, this redirects the browser away from the application to upstream provider, such as the Google login page.

## Configurable Grants

Dex supports various OAuth2 and OpenID Connect grant types. You can control which grant types are available by configuring the `grantTypes` setting.

```yaml
oauth2:
  grantTypes:
    - "authorization_code"
    - "refresh_token"
    - "urn:ietf:params:oauth:grant-type:token-exchange"
```

### Available grant types

The following grant types can be enabled or disabled:

| Grant Type | Description | Special Configuration |
|-----------|-------------|---------------------|
| `authorization_code` | Authorization Code Flow - recommended for web and mobile applications | - |
| `refresh_token` | Refresh Token Grant - allows clients to obtain new access tokens without user interaction | - |
| `password` | Resource Owner Password Credentials Flow - deprecated and less secure | **Requires `passwordConnector` to be set** |
| `client_credentials` | Client Credentials Flow - for server-to-server communication | **Requires feature flag:** `DEX_CLIENT_CREDENTIAL_GRANT_ENABLED_BY_DEFAULT=true` |
| `urn:ietf:params:oauth:grant-type:token-exchange` | Token Exchange Grant (RFC 8693) - allows clients to exchange tokens from external identity providers | - |
| `urn:ietf:params:oauth:grant-type:device_code` | Device Code Grant (RFC 8628) - for devices with limited input capabilities | - |

{{% alert color="warning" %}}
**Important Notes:**
- **Implicit Flow** is not configured via `grantTypes`. Instead, use the `responseTypes` setting (see [Authentication flow](#authentication-flow) section above).
- **Password Grant** will not work unless `passwordConnector` is configured (see [Password grants](#password-grants) section below).
- **Client Credentials Grant** requires the environment variable `DEX_CLIENT_CREDENTIAL_GRANT_ENABLED_BY_DEFAULT=true` to be set.
{{% /alert %}}

### Default behavior

If the `grantTypes` field is not specified, Dex enables these default grant types:
- `authorization_code`
- `refresh_token`
- `urn:ietf:params:oauth:grant-type:token-exchange`

{{% alert color="info" %}}
To use token exchange and device grants, the supported upstream connector must be properly configured. Token exchange works with OIDC connectors, while device code flow requires additional configuration.
{{% /alert %}}

### Examples

**Enable only Authorization Code flow:**
```yaml
oauth2:
  grantTypes: [ "authorization_code" ]
```

**Enable client credentials grant for server-to-server authentication:**

Set the required environment variable, client credentials grant is enabled by default:
```bash
export DEX_CLIENT_CREDENTIAL_GRANT_ENABLED_BY_DEFAULT=true
```

**Enable password grant (not recommended):**
```yaml
oauth2:
  passwordConnector: local  # Required for password grant
```

Password grants involve clients directly sending a user's credentials (`username` and `password`) to the authorization server (dex), acquiring access tokens without the need for an intermediate authorization step.

**Enable Implicit Flow:**

Implicit flow is configured via `responseTypes`, not `grantTypes`:
```yaml
oauth2:
  responseTypes: [ "id_token", "token" ]
```

### Configuration options

* `grantTypes` - list of enabled grant types (see [Configurable Grants](#configurable-grants) section above). To enable password grants, ensure `"password"` is included in this list.
* `passwordConnector` - specifies the connector's id that is used for password grants

{{% alert title="Warning" color="warning" %}}
The password grant type is not recommended for use by the [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics-13#section-3.4) because of serious security concerns.
Please see [oauth.net](https://oauth.net/2/grant-types/password/) for additional information.
{{% /alert %}}
