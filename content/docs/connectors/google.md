---
title: "Authentication Through Google"
linkTitle: "Google"
description: ""
date: 2020-09-30
draft: false
toc: true
weight: 2060
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
    #domainToAdminEmail:
    #  *: super-user@example.com
    #  my-domain.com: super-user@my-domain.com
```

## Fetching groups from Google
To allow Dex to fetch group information from Google, you will need to configure a service account for Dex to use.
This account needs Domain-Wide Delegation and permission to access the `https://www.googleapis.com/auth/admin.directory.group.readonly` API scope.

To get group fetching set up:

1. Follow the [instructions](https://developers.google.com/admin-sdk/directory/v1/guides/delegation) to set up a service account with Domain-Wide Delegation
  - During service account creation, a JSON key file will be created that contains authentication information for the service account. This needs storing in a location accessible by Dex and you will set the `serviceAccountFilePath` to point at it.
  - When delegating the API scopes to the service account, delegate the `https://www.googleapis.com/auth/admin.directory.group.readonly` scope and only this scope. If you delegate more scopes to the service account, it will not be able to access the API.
2. Enable the [Admin SDK](https://console.developers.google.com/apis/library/admin.googleapis.com/)
3. Add the `serviceAccountFilePath` and `domainToAdminEmail` configuration options to your Dex config.
  - `serviceAccountFilePath` should point to the location of the service account JSON key file

## GKE Workload Identity
When operating DEX on GKE or GCE, it's possible and better to use the service account derived from [metadata](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) to retrieve groups. The google service account must have the Service Account Token Creator role (`roles/iam.serviceAccountTokenCreator`). If this is the case, it becomes unnecessary to specify the `serviceAccountFilePath` configuration option.
  - `domainToAdminEmail` should be mapping between the base domain and the email of a Google Workspace user with a minimum of the `Groups Reader (BETA)` Role assigned. The service account you created earlier will impersonate this user when making calls to the admin API. A valid user should be able to retrieve a list of groups when [testing the API](https://developers.google.com/admin-sdk/directory/v1/reference/groups/list#try-it).
