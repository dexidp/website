---
title: "Authentication Through Microsoft"
linkTitle: "Microsoft"
description: ""
date: 2020-09-30
draft: false
toc: true
weight: 2080
---

## Overview

One of the login options for dex uses the Microsoft OAuth2 flow to identify the
end user through their Microsoft account.

When a client redeems a refresh token through dex, dex will re-query Microsoft
to update user information in the ID Token. To do this, __dex stores a readonly
Microsoft access and refresh tokens in its backing datastore.__ Users that
reject dex's access through Microsoft will also revoke all dex clients which
authenticated them through Microsoft.

### Caveats

`groups` claim in dex is only supported when `tenant` is specified in Microsoft
connector config. Furthermore, `tenant` must also be configured to either 
`<tenant uuid>` or `<tenant name>` (see [Configuration](#configuration)). In 
order for dex to be able to list groups on behalf of logged in user, an 
explicit organization administrator consent is required. To obtain the 
consent do the following:

  - when registering dex application on https://apps.dev.microsoft.com add
    an explicit `Directory.Read.All` permission to the list of __Delegated
    Permissions__
  - open the following link in your browser and log in under organization
    administrator account:

`https://login.microsoftonline.com/<tenant>/adminconsent?client_id=<dex client id>`

## Configuration

Register a new application on https://apps.dev.microsoft.com via `Add an app`
ensuring the callback URL is `(dex issuer)/callback`. For example if dex
is listening at the non-root path `https://auth.example.com/dex` the callback
would be `https://auth.example.com/dex/callback`.

The following is an example of a configuration for `examples/config-dev.yaml`:

```yaml
connectors:
  - type: microsoft
    # Required field for connector id.
    id: microsoft
    # Required field for connector name.
    name: Microsoft
    config:
      # Credentials can be string literals or pulled from the environment.
      clientID: $MICROSOFT_APPLICATION_ID
      clientSecret: $MICROSOFT_CLIENT_SECRET
      redirectURI: http://127.0.0.1:5556/dex/callback
```

`tenant` configuration parameter controls what kinds of accounts may be
authenticated in dex. By default, all types of Microsoft accounts (consumers
and organizations) can authenticate in dex via Microsoft. To change this, set
the `tenant` parameter to one of the following:

- `common`- both personal and business/school accounts can authenticate in dex
  via Microsoft (default)
- `consumers` - only personal accounts can authenticate in dex
- `organizations` - only business/school accounts can authenticate in dex
- `<tenant uuid>` or `<tenant name>` - only accounts belonging to specific
  tenant identified by either `<tenant uuid>` or `<tenant name>` can
  authenticate in dex

For example, the following snippet configures dex to only allow business/school
accounts:

```yaml
connectors:
  - type: microsoft
    # Required field for connector id.
    id: microsoft
    # Required field for connector name.
    name: Microsoft
    config:
      # Credentials can be string literals or pulled from the environment.
      clientID: $MICROSOFT_APPLICATION_ID
      clientSecret: $MICROSOFT_CLIENT_SECRET
      redirectURI: http://127.0.0.1:5556/dex/callback
      tenant: organizations
```

`scopes` configuration parameter controls what the initial scope(s) of the identity
token that dex requests from Microsoft. To change this initial set, configure
the `scopes` parameter to be a list of one or more valid scopes (as defined in
[Microsoft Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent)).

The default scope (if one is not specified in the connector's configuration) is
`user.read`.

The scope list requested may also be appended by specifying [groups](#groups) or
requesting a new token through the use of a refresh token.

For example, the following snippet configures dex to request an OpenID token
with only getting the email address associated with the account and nothing else:

```yaml
connectors:
  - type: microsoft
    # Required field for connector id.
    id: microsoft
    # Required field for connector name.
    name: Microsoft
    config:
      # Credentials can be string literals or pulled from the environment.
      clientID: $MICROSOFT_APPLICATION_ID
      clientSecret: $MICROSOFT_CLIENT_SECRET
      redirectURI: http://127.0.0.1:5556/dex/callback
      scopes:
        - openid
        - email
```

### Groups

When the `groups` claim is present in a request to dex __and__ `tenant` is
configured, dex will query Microsoft API to obtain a list of groups the user is
a member of. `onlySecurityGroups` configuration option restricts the list to
include only security groups. By default all groups (security, Office 365,
mailing lists) are included.

Please note that `tenant` must be configured to either `<tenant uuid>` or 
`<tenant name>` for this to work. For more details on `tenant` configuration,
see [Configuration](#configuration).

By default, dex resolve groups ids to groups names, to keep groups ids, you can
specify the configuration option `groupNameFormat: id`.

It is possible to require a user to be a member of a particular group in order
to be successfully authenticated in dex. For example, with the following
configuration file only the users who are members of at least one of the listed
groups will be able to successfully authenticate in dex:

```yaml
connectors:
  - type: microsoft
    # Required field for connector id.
    id: microsoft
    # Required field for connector name.
    name: Microsoft
    config:
      # Credentials can be string literals or pulled from the environment.
      clientID: $MICROSOFT_APPLICATION_ID
      clientSecret: $MICROSOFT_CLIENT_SECRET
      redirectURI: http://127.0.0.1:5556/dex/callback
      tenant: myorg.onmicrosoft.com
      groups:
        - developers
        - devops
```

Also, `useGroupsAsWhitelist` configuration option, can restrict the groups
claims to include only the user's groups that are in the configured `groups`.

You can use the emailToLowercase (boolean) configuration option to streamline 
UPNs (user email) from Active Directory before putting them into an id token.
Without this option, it can be tough to match the email claim because a client 
application doesn't know whether an email address has been added with 
capital- or lowercase letters.
For example, it is hard to bind Roles in Kubernetes using email as a user name 
(--oidc-username-claim=email flag) because user names are case sensitive.

```yaml
connectors:
  - type: microsoft
    # Required field for connector id.
    id: microsoft
    # Required field for connector name.
    name: Microsoft
    config:
      # Credentials can be string literals or pulled from the environment.
      clientID: $MICROSOFT_APPLICATION_ID
      clientSecret: $MICROSOFT_CLIENT_SECRET
      redirectURI: http://127.0.0.1:5556/dex/callback
      tenant: myorg.onmicrosoft.com
      groups:
        - developers
        - devops
      # All relevant E-Mail Addresses delivered by AD will transformed to
      # lowercase if config is TRUE
      emailToLowercase: true
```