---
title: "Authentication Through Google"
linkTitle: "Google"
description: ""
date: 2020-09-30
draft: false
toc: true
weight: 60
---

## Overview

Dex is able to use Google's OpenID Connect provider as an authentication source.

The connector uses the same authentication flow as the OpenID Connect provider but adds Google specific features such as Hosted domain support and reading groups using a service account.

## Configuration

```yaml
connectors:
- type: google
  id: google
  name: Google
  config:

    # Connector config values starting with a "$" will read from the environment.
    clientID: $GOOGLE_CLIENT_ID
    clientSecret: $GOOGLE_CLIENT_SECRET

    # Dex's issuer URL + "/callback"
    redirectURI: http://127.0.0.1:5556/callback

    # Google supports whitelisting allowed domains when using G Suite
    # (Google Apps). The following field can be set to a list of domains
    # that can log in:
    #
    # hostedDomains:
    #  - example.com

    # The Google connector supports whitelisting allowed groups when using G Suite
    # (Google Apps). The following field can be set to a list of groups
    # that can log in:
    #
    # groups:
    #  - admins@example.com

    # Google does not support the OpenID Connect groups claim and only supports
    # fetching a user's group membership with a service account.
    # This service account requires an authentication JSON file and the email
    # of a G Suite admin to impersonate:
    #
    #serviceAccountFilePath: googleAuth.json
    #adminEmail: super-user@example.com
```

## Fetching groups from Google
To allow Dex to fetch group information from Google, you must configure a method to retrieve group information

### Accessing group information from the user directly
This method is only available to Google Workspace Enterprise Standard, Enterprise Plus, Enterprise for Education, and Cloud Identity Premium accounts

You'll need the `https://www.googleapis.com/auth/cloud-identity.groups.readonly` scope:

```yaml
connectors:
- type: google
  id: google
  name: Google
  config:
    # ...
    scopes:
    # These are default and required
    - profile
    - email
    - https://www.googleapis.com/auth/cloud-identity.groups.readonly
```

The project that owns the OAuth client ID must also have [Cloud Identity API](https://console.developers.google.com/apis/library/cloudidentity.googleapis.com) enabled. Also, [non-Google Groups](https://cloud.google.com/identity/docs/groups#group_types) will not show up in groups.

### Using domain-wide delegation and a service account
This method requires setting up domain-wide delegation to a Google service account.

1. Follow the [instructions](https://developers.google.com/admin-sdk/directory/v1/guides/delegation) to set up a service account with Domain-Wide Delegation
  - During service account creation, a JSON key file will be created that contains authentication information for the service account. This needs storing in a location accessible by Dex and you will set the `serviceAccountFilePath` to point at it.
  - When delegating the API scopes to the service account, delegate the `https://www.googleapis.com/auth/admin.directory.group.readonly` scope and only this scope. If you delegate more scopes to the service account, it will not be able to access the API.
2. Enable the [Admin SDK](https://console.developers.google.com/apis/library/admin.googleapis.com/)
3. Add the `serviceAccountFilePath` and `adminEmail` configuration options to your Dex config.
  - `serviceAccountFilePath` should point to the location of the service account JSON key file
  - `adminEmail` should be the email of a G Suite super user. The service account you created earlier will impersonate this user when making calls to the admin API. A valid user should be able to retrieve a list of groups when [testing the API](https://developers.google.com/admin-sdk/directory/v1/reference/groups/list#try-it).
