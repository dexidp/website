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

Once the local connector is enabled, users can be added in two ways: statically within the configuration file or dynamically through the [gRPC API](/docs/api)

### Static configuration (config file)
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


### Dynamic configuration (API)

