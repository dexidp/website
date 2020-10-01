---
title: "Authentication through an OpenID Connect provider"
description: ""
date: 2020-09-30
draft: true
toc: true
weight: 20
---

## Overview

Dex is able to use another OpenID Connect provider as an authentication source. When logging in, dex will redirect to the upstream provider and perform the necessary OAuth2 flows to determine the end users email, username, etc. More details on the OpenID Connect protocol can be found in [_An overview of OpenID Connect_](../openid-connect.md).

Prominent examples of OpenID Connect providers include Google Accounts, Salesforce, and Azure AD v2 ([not v1][azure-ad-v1]).

## Caveats

When using refresh tokens, changes to the upstream claims aren't propagated to the id_token returned by dex. If a user's email changes, the "email" claim returned by dex won't change unless the user logs in again. Progress for this is tracked in [issue #863][issue-863].

## Configuration

```yaml
connectors:
- type: oidc
  id: google
  name: Google
  config:
    # Canonical URL of the provider, also used for configuration discovery.
    # This value MUST match the value returned in the provider config discovery.
    #
    # See: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
    issuer: https://accounts.google.com

    # Connector config values starting with a "$" will read from the environment.
    clientID: $GOOGLE_CLIENT_ID
    clientSecret: $GOOGLE_CLIENT_SECRET

    # Dex's issuer URL + "/callback"
    redirectURI: http://127.0.0.1:5556/callback


    # Some providers require passing client_secret via POST parameters instead
    # of basic auth, despite the OAuth2 RFC discouraging it. Many of these
    # cases are caught internally, but some may need to uncomment the
    # following field.
    #
    # basicAuthUnsupported: true
    
    # Google supports whitelisting allowed domains when using G Suite
    # (Google Apps). The following field can be set to a list of domains
    # that can log in:
    #
    # hostedDomains:
    #  - example.com

    # List of additional scopes to request in token response
    # Default is profile and email
    # Full list at https://github.com/dexidp/dex/blob/master/Documentation/custom-scopes-claims-clients.md
    # scopes:
    #  - profile
    #  - email
    #  - groups

    # Some providers return claims without "email_verified", when they had no usage of emails verification in enrollment process
    # or if they are acting as a proxy for another IDP etc AWS Cognito with an upstream SAML IDP
    # This can be overridden with the below option
    # insecureSkipEmailVerified: true 

    # Groups claims (like the rest of oidc claims through dex) only refresh when the id token is refreshed
    # meaning the regular refresh flow doesn't update the groups claim. As such by default the oidc connector
    # doesn't allow groups claims. If you are okay with having potentially stale group claims you can use
    # this option to enable groups claims through the oidc connector on a per-connector basis.
    # This can be overridden with the below option
    # insecureEnableGroups: true

    # When enabled, the OpenID Connector will query the UserInfo endpoint for additional claims. UserInfo claims
    # take priority over claims returned by the IDToken. This option should be used when the IDToken doesn't contain
    # all the claims requested.
    # https://openid.net/specs/openid-connect-core-1_0.html#UserInfo
    # getUserInfo: true

    # The set claim is used as user id.
    # Claims list at https://openid.net/specs/openid-connect-core-1_0.html#Claims
    # Default: sub
    # userIDKey: nickname

    # The set claim is used as user name.
    # Default: name
    # userNameKey: nickname

    # For offline_access, the prompt parameter is set by default to "prompt=consent". 
    # However this is not supported by all OIDC providers, some of them support different
    # value for prompt, like "prompt=login" or "prompt=none"
    # promptType: consent

    # Some providers return non-standard claims (eg. mail).
    # Use claimMapping to map those claims to standard claims:
    # https://openid.net/specs/openid-connect-core-1_0.html#Claims
    # claimMapping can only map a non-standard claim to a standard one if it's not returned in the id_token.
    claimMapping:
      # The set claim is used as preferred username.
      # Default: preferred_username
      # preferred_username: other_user_name

      # The set claim is used as email.
      # Default: email
      # email: mail

      # The set claim is used as groups.
      # Default: groups
      # groups: "cognito:groups"
```

[oidc-doc]: openid-connect.md
[issue-863]: https://github.com/dexidp/dex/issues/863
[azure-ad-v1]: https://github.com/coreos/go-oidc/issues/133
