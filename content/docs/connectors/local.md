---
linkTitle: "BuiltIn (local)"
title: "Authentication Through the builtin connector"
description: ""
date: 2024-01-05
draft: false
toc: true
weight: 2110
---

## Overview
Dex comes with a built-in local connector, acting as a "virtual" identity provider within Dex's ecosystem, securely storing login credentials in the specified [storage](/docs/storage).
This local connector simplifies authentication workflows by managing and storing user credentials directly within Dex's infrastructure.


## Configuration
The local connector can be utilized by adding the following flag to the configuration.
```yaml
enablePasswordDB: true
```

### Creating Users

Once the local connector is enabled, users can be added in two ways: statically within the configuration file or dynamically through the [gRPC API](/docs/api).

#### Static configuration (config file)
```yaml
staticPasswords:
  - email: "admin@example.com"
    # bcrypt hash of the string "password": $(echo password | htpasswd -BinC 10 admin | cut -d: -f2)
    hash: "$2a$10$2b2cU8CPhOTaGrs1HRQuAueS7JTT5ZHsHSzYiFPm1leZck7Mc8T4W"
    username: "admin"
    userID: "08a8684b-db88-4b73-90a9-3cd1661f5466"
```

To specify users within the configuration file, the `staticPasswords` option can be used. It contains a list of predefined users, each defined by the following entities:

* `email`: The email address of the user (used as the main identifier).
* `hash`: The bcrypt hash of the user's password.
* `username`: The username associated with the user.
* `userID`: The unique identifier (ID) of the user.


#### Dynamic configuration (API)
Users can be dynamically managed via the gRPC API, offering a versatile method to handle user-related operations within the system.
This functionality enables seamless additions, updates, and removals of users, providing a flexible approach to user management.
For comprehensive information and detailed procedures, please refer to the specific [API documentation](/docs/api).

### Obtaining a token
Let's explore a sample configuration in dex that involves a public and private client along with a static user.
Both local users and password grants are enabled, allowing the exchange of a token for user credentials.

```yaml
issuer: http://localhost:8080/dex
storage:  # .. storage configuration
# Setup clients
staticClients:
  - id: public-client
    public: true
    name: 'Public Client'
    redirectURIs:
      - 'https://example.com/oidc/callback'
  - id: private-client
    secret: app-secret
    name: 'Private Client'
    redirectURIs:
      - 'https://example.com/oidc/callback'
# Set up an test user
staticPasswords:
  - email: "admin@example.com"
    # bcrypt hash of the string "password": $(echo password | htpasswd -BinC 10 admin | cut -d: -f2)
    hash: "$2a$10$2b2cU8CPhOTaGrs1HRQuAueS7JTT5ZHsHSzYiFPm1leZck7Mc8T4W"
    username: "admin"
    userID: "08a8684b-db88-4b73-90a9-3cd1661f5466"

# Enable local users
enablePasswordDB: true
# Allow password grants with local users
oauth2:
  passwordConnector: local
```

Depending on whether you use a public or a private client you need to either include the just `clientId` or the `clientId` and `clientPassword` in the authorization header.

**Public Client**
```shell
curl -L -X POST 'http://localhost:8080/dex/token' \
-H 'Authorization: Basic cHVibGljLWNsaWVudAo=' \ # base64 encoded: public-client
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=password' \
--data-urlencode 'scope=openid profile' \
--data-urlencode 'username=admin@example.com' \
--data-urlencode 'password=admin'
```


**Private Client**
```shell
curl -L -X POST 'http://localhost:8080/dex/token' \
-H 'Authorization: Basic cHJpdmF0ZS1jbGllbnQ6YXBwLXNlY3JldAo=' \ # base64 encoded: private-client:app-secret
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=password' \
--data-urlencode 'scope=openid' \
--data-urlencode 'username=admin@example.com' \
--data-urlencode 'password=admin'
```
