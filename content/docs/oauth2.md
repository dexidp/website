---
title: "OAuth2 Options"
description: ""
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
* `alwaysShowLoginScreen` - whether to always display the login screen. If only one authentication method is enabled, the default behavior is to go directly to it. For connected IdPs, this redirects the browser away from the application to upstream provider, such as the Google login page.

## Password grants
Password grants involve clients directly sending a user's credentials (`username` and `password`) to the authorization server (dex), acquiring access tokens without the need for an intermediate authorization step.
```yaml
oauth2:
  passwordConnector: local
```
* `passwordConnector` -  specifies the connector's id that is used for password grants

**WARNING:** The password grant type is not recommended for use by the [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics-13#section-3.4) because of serious security concerns.
Please see [oauth.net](https://oauth.net/2/grant-types/password/) for additional information.
