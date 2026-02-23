---
title: "Tokens"
linkTitle: "Tokens"
description: "Types of tokens and expiration settings"
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
  * `idTokens` - the lifetime of if tokens. It is preferable to use short-lived id tokens, e.g., 10 minutes.
  * `authRequests` - the time frame in which users can exchange a code for an access or id token.
  * `deviceRequests` - the time frame in which users can authorize a device to receive an access or id token.
  * `signingKeys` - the period of time after which the signing keys are rotated. It is recommended to rotate keys regularly. If the `idTokens` lifetime exceeds, public parts of signing keys will be kept for validation for the extra time.
  * `refreshTokens` - section for various refresh token settings:
    * `validIfNotUsedFor` - invalidate a refresh token if it is not used for a specified amount of time.
    * `absoluteLifetime` - a stricter variant of the previous option, absolute lifetime of a refresh token. It forces users to reauthenticate and obtain a new refresh token.
    * `disableRotation` - completely disables every-request rotation. The user will also have to specify one of the previous refresh token options to keep refresh tokens secure when toggling this.
    * `reuseInterval` - allows getting the same refresh token from refresh endpoint within a specified interval, but only if the user's request contains the previous refresh token.

__NOTE__: `disableRotation` and `reuseInterval` options help effectively deal with network lags, concurrent requests, and so on in tradeoff for security. Use them with caution.

## Token signing configuration

Dex provides flexible token signing options through the `signer` configuration section. You can choose between a local signer or integrate with Vault-compatible APIs for centralized key management.

### Local signer

The local signer uses keys managed by Dex's storage backend with automatic rotation. This is the default option for simple deployments.

* `type` - set to `local` to use local signing
* `config` - configuration section for local signer:
  * `keysRotationPeriod` - (required) the period after which signing keys are rotated (e.g., `6h`, `24h`)

**Supported signing algorithms (not configurable):**

* `RS256` (RSA with SHA-256)

Example configuration:
```yaml
signer:
  type: local
  config:
    keysRotationPeriod: 6h
```

### Vault-compatible signer

For enhanced security and centralized key management. This allows you to use HashiCorp Vault or OpenBao for signing operations without storing keys locally.

* `type` - set to `vault` to use Vault-compatible API
* `config` - configuration section for Vault signer:
  * `keyName` - (required) the key identifier in Vault/OpenBao to use for signing (e.g., `dex/signing-key`)
  * `addr` - Vault/OpenBao server address (optional, can be set via `VAULT_ADDR` environment variable)
  * `token` - authentication token for Vault/OpenBao (optional, can be set via `VAULT_TOKEN` environment variable)

**Supported signing algorithms:**

* `RS256` (RSA with SHA-256)
* `ES256` (ECDSA with SHA-256)
* `ES384` (ECDSA with SHA-384)
* `ES512` (ECDSA with SHA-512)
* `EdDSA` (Edwards-curve Digital Signature Algorithm)

The signing algorithm is determined by the key type configured in Vault/OpenBao's Transit backend.

{{% alert title="Note" color="primary" %}}
Only the `keyName` parameter is required. The `addr` and `token` can be provided through environment variables, making it easier to manage sensitive credentials without exposing them in configuration files.
{{% /alert %}}

Example configuration:
```yaml
signer:
  type: vault
  config:
    keyName: dex/signing-key
    addr: http://localhost:8200
    token: test-token
```

Using environment variables:
```yaml
signer:
  type: vault
  config:
    keyName: dex/signing-key
```

With environment variables set:
```bash
export VAULT_ADDR=https://vault.example.com:8200
export VAULT_TOKEN=your-vault-token
```

This approach ensures that signing keys never leave your Vault/OpenBao server, providing better security and auditability of key operations.

{{% alert title="Note" color="primary" %}}
Dex supports Vault-compatible APIs through [OpenBao API v2 integration package](https://pkg.go.dev/github.com/openbao/openbao/api/v2).

Integration tests for Dex guarantee compatibility with Vault, but it may change in the future.
{{% /alert %}}

[aws-sts]: https://docs.aws.amazon.com/STS/latest/APIReference/Welcome.html
[connectors]: /docs/connectors
[jwt-io]: https://jwt.io/
[kubernetes]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens
[openbao]: https://pkg.go.dev/github.com/openbao/openbao/api/v2
[rfc6819-5.2.2.3]: https://tools.ietf.org/html/rfc6819#section-5.2.2.3
[standard-claims]: https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
[using-dex]: /docs/guides/using-dex
