---
title: "ID Tokens"
linkTitle: "ID Tokens"
description: ""
date: 2020-10-21
draft: false
toc: true
weight: 1013
---

## Overview

ID Tokens are an OAuth2 extension introduced by OpenID Connect and Dex's primary feature. ID Tokens are [JSON Web Tokens][jwt-io] (JWTs) signed by Dex and returned as part of the OAuth2 response that attest to the end user's identity. An example JWT might look like:

```bash
eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkNDQ3NDFmNzczYjkzOGNmNjVkZDMyNjY4NWI4NjE4MGMzMjRkOTkifQ.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU1NTYvZGV4Iiwic3ViIjoiQ2djeU16UXlOelE1RWdabmFYUm9kV0kiLCJhdWQiOiJleGFtcGxlLWFwcCIsImV4cCI6MTQ5Mjg4MjA0MiwiaWF0IjoxNDkyNzk1NjQyLCJhdF9oYXNoIjoiYmk5NmdPWFpTaHZsV1l0YWw5RXFpdyIsImVtYWlsIjoiZXJpYy5jaGlhbmdAY29yZW9zLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJncm91cHMiOlsiYWRtaW5zIiwiZGV2ZWxvcGVycyJdLCJuYW1lIjoiRXJpYyBDaGlhbmcifQ.OhROPq_0eP-zsQRjg87KZ4wGkjiQGnTi5QuG877AdJDb3R2ZCOk2Vkf5SdP8cPyb3VMqL32G4hLDayniiv8f1_ZXAde0sKrayfQ10XAXFgZl_P1yilkLdknxn6nbhDRVllpWcB12ki9vmAxklAr0B1C4kr5nI3-BZLrFcUR5sQbxwJj4oW1OuG6jJCNGHXGNTBTNEaM28eD-9nhfBeuBTzzO7BKwPsojjj4C9ogU4JQhGvm_l4yfVi0boSx8c0FX3JsiB0yLa1ZdJVWVl9m90XmbWRSD85pNDQHcWZP9hR6CMgbvGkZsgjG32qeRwUL_eNkNowSBNWLrGNPoON1gMg
```

ID Tokens contains standard claims assert which client app logged the user in, when the token expires, and the identity of the user.

```json
{
  "iss": "http://127.0.0.1:5556/dex",
  "sub": "CgcyMzQyNzQ5EgZnaXRodWI",
  "aud": "example-app",
  "exp": 1492882042,
  "iat": 1492795642,
  "at_hash": "bi96gOXZShvlWYtal9Eqiw",
  "email": "jane.doe@coreos.com",
  "email_verified": true,
  "groups": [
    "admins",
    "developers"
  ],
  "name": "Jane Doe"
}
```

Because these tokens are signed by Dex and [contain standard-based claims][standard-claims] other services can consume them as service-to-service credentials. Systems that can already consume OpenID Connect ID Tokens issued by Dex include:

* [Kubernetes][kubernetes]
* [AWS STS][aws-sts]

For details on how to request or validate an ID Token, see [“_Writing apps that use Dex_.”][using-dex]

## Refresh tokens
Refresh tokens are credentials used to obtain access tokens. Refresh tokens are issued to the client by the authorization server and are used to obtain
a new id token when the current id token becomes invalid or expires. Issuing a refresh token is optional and is provided by passing `offline_access` scope to Dex server.

__NOTE__: Some connectors do not support `offline_access` scope. You can find out which connectors support refresh tokens by looking into the [_connectors list_][connectors].

Example of a server response with refresh token:
```json
{
 "access_token": "eyJhbGciOiJSUzI1N...",
 "token_type": "Bearer",
 "refresh_token": "lxzzsvasxho5exvwkfa5zhefl",
 "expires_in": 3600,
 "id_token": "eyJhbGciO..."
}
```

__NOTE__: For every refresh of an id token, Dex issues a new refresh token. This security measure is called _refresh token rotation_
and prevents someone stealing it. The idea is described in detail in the corresponding [RFC][rfc6819-5.2.2.3].

## Expiration and rotation settings

Dex has a section in the config file where you can specify expiration and rotation settings for id tokens and refresh tokens.
__NOTE__: All duration options should be set in the format: number + time unit (s, m, h), e.g., `10m`.

* `expiry` - section for various expiration settings, including token settings:
  * `idTokens` - the lifetime of id_token. It is preferable to use short-lived id tokens.
  * `refreshTokens` - section for various refresh token settings:
    * `validForIfNotUsed` - invalidate a refresh token if it is not used for a specified amount of time.
    * `absoluteLifetime` - a stricter variant of the previous option, absolute lifetime of a refresh token. It forces users to reauthenticate and obtain a new refresh token.
    * `disableRotation` - completely disables every-request rotation. The user will also have to specify one of the previous refresh token options to keep refresh tokens secure when toggling this.
    * `reuseInterval` - allows getting the same refresh token from refresh endpoint within a specified interval, but only if the user's request contains the previous refresh token.

__NOTE__: `disableRotation` and `reuseInterval` options help effectively deal with network lags, concurrent requests, and so on in tradeoff for security. Use them with caution.

[aws-sts]: https://docs.aws.amazon.com/STS/latest/APIReference/Welcome.html
[connectors]: connectors
[jwt-io]: https://jwt.io/
[kubernetes]: http://kubernetes.io/docs/admin/authentication/#openid-connect-tokens
[rfc6819-5.2.2.3]: https://tools.ietf.org/html/rfc6819#section-5.2.2.3
[standard-claims]: https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
[using-dex]: using-dex
