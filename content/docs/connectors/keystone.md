---
title: "Authentication Through OpenStack Keystone"
linkTitle: "OpenStack Keystone"
description: ""
date: 2021-03-11
draft: false
toc: true
weight: 2135
---

## Overview

[Keystone](https://docs.openstack.org/keystone/latest/) is an OpenStack service that provides API client authentication, service discovery, and distributed multi-tenant authorization. 

OpenStack Keystone connector supports `offline_access` and `groups` scopes. To use this connector, create a domain and user with an admin role, then specify the credentials in the configuration file (see the example below).

OpenStack Keystone exposes the [Identity API v3](https://docs.openstack.org/api-ref/identity/v3/) to work with dex.


## Configuration

The following is an example of an OpenStack Keystone configuration for dex:

```yaml
connectors:
  - type: keystone
    # Required field for connector id.
    id: keystone
    # Required field for connector name.
    name: Keystone
    config:
      # Required, without v3 suffix.
      keystoneHost: http://example:5000
      # Required, admin user credentials to connect to keystone.
      domain: default
      keystoneUsername: demo 
      keystonePassword: DEMO_PASS
```
