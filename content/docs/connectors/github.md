---
title: "Authentication Through GitHub"
linkTitle: "GitHub"
description: ""
date: 2020-09-30
draft: false
toc: true
weight: 2020
---

## Overview

One of the login options for dex uses the GitHub OAuth2 flow to identify the end user through their GitHub account.

When a client redeems a refresh token through dex, dex will re-query GitHub to update user information in the ID Token. To do this, __dex stores a readonly GitHub access token in its backing datastore.__ Users that reject dex's access through GitHub will also revoke all dex clients which authenticated them through GitHub.

## Caveats

* A user must explicitly [request][github-request-org-access] an [organization][github-orgs] give dex [resource access][github-approve-org-access]. Dex will not have the correct permissions to determine if the user is in that organization otherwise, and the user will not be able to log in. This request mechanism is a feature of the GitHub API.

## Configuration

Register a new application with [GitHub][github-oauth2] ensuring the callback URL is `(dex issuer)/callback`. For example if dex is listening at the non-root path `https://auth.example.com/dex` the callback would be `https://auth.example.com/dex/callback`.

The following is an example of a configuration for `examples/config-dev.yaml`:

```yaml
connectors:
- type: github
  # Required field for connector id.
  id: github
  # Required field for connector name.
  name: GitHub
  config:
    # Credentials can be string literals or pulled from the environment.
    clientID: $GITHUB_CLIENT_ID
    clientSecret: $GITHUB_CLIENT_SECRET
    redirectURI: http://127.0.0.1:5556/dex/callback

    # Legacy 'org' field.
    #  - A user MUST be a member of the following org to authenticate with dex.
    #  - Both 'org' and 'orgs' can NOT be used simultaneously.
    #org: my-organization

    # List of org and team names.
    #  - If specified, a user MUST be a member of at least ONE of these orgs
    #    and teams (if set) to authenticate with dex.
    #  - Dex queries the following organizations for group information if the
    #    "groups" scope is requested. Group claims are formatted as "(org):(team)".
    #    For example if a user is part of the "engineering" team of the "coreos" org,
    #    the group claim would include "coreos:engineering".
    #  - If teams are specified, dex only returns group claims for those teams.
    orgs:
    - name: my-organization
    - name: my-organization-with-teams
      teams:
      - red-team
      - blue-team

    # Flag which indicates that all the user's orgs and teams should be loaded.
    # Only works if neither 'org' nor 'orgs' are specified in the config.
    loadAllGroups: false

    # How the team names are formatted.
    #  - Options: 'name' (default), 'slug', 'both'.
    #  - Examples:
    #    - 'name': 'acme:Site Reliability Engineers'
    #    - 'slug': 'acme:site-reliability-engineers'
    #    - 'both': 'acme:Site Reliability Engineers', 'acme:site-reliability-engineers'
    teamNameField: slug

    # Flag which will switch from using the internal GitHub id to the users handle (@mention) as the user id.
    # It is possible for a user to change their own username, but it is very rare for them to do so
    useLoginAsID: false

    # A preferred email domain to use when returning the user's email.
    #  - If the user has a PUBLIC email, it is ALWAYS returned in the email claim,
    #    so this field would have NO effect (this may change in the future).
    #  - By default, if the user does NOT have a public email, their primary email is returned.
    #  - When 'preferredEmailDomain' is set, the first email matching this domain is returned,
    #    we fall back to the primary email if no match is found.
    #  - To allow multiple subdomains, you may specify a wildcard like "*.example.com"
    #    which will match "aaaa.example.com" and "bbbb.example.com", but NOT "example.com".
    #  - To return the user's no-reply email, set this field to "users.noreply.github.com",
    #    this is a mostly static email that GitHub assigns to the user. These emails
    #    are formatted like 'ID+USERNAME@users.noreply.github.com' for newer accounts
    #    and 'USERNAME@users.noreply.github.com' for older accounts.
    #preferredEmailDomain: "example.com"
```

## GitHub Enterprise

Users can use their GitHub Enterprise account to login to dex. The following configuration can be used to enable a GitHub Enterprise connector on dex:

```yaml
connectors:
- type: github
  # Required field for connector id.
  id: github
  # Required field for connector name.
  name: GitHub
  config:
    # Required fields. Dex must be pre-registered with GitHub Enterprise
    # to get the following values.
    # Credentials can be string literals or pulled from the environment.
    clientID: $GITHUB_CLIENT_ID
    clientSecret: $GITHUB_CLIENT_SECRET
    redirectURI: http://127.0.0.1:5556/dex/callback

    # List of org and team names.
    #  - If specified, a user MUST be a member of at least ONE of these orgs
    #    and teams (if set) to authenticate with dex.
    #  - Dex queries the following organizations for group information if the
    #    "groups" scope is requested. Group claims are formatted as "(org):(team)".
    #    For example if a user is part of the "engineering" team of the "coreos" org,
    #    the group claim would include "coreos:engineering".
    #  - If teams are specified, dex only returns group claims for those teams.
    orgs:
    - name: my-organization
    - name: my-organization-with-teams
      teams:
      - red-team
      - blue-team

    # Flag which indicates that all the user's orgs and teams should be loaded.
    # Only works if neither 'org' nor 'orgs' are specified in the config.
    loadAllGroups: false

    # How the team names are formatted
    #  - Options: 'name' (default), 'slug', 'both'.
    #  - Examples:
    #    - 'name': 'acme:Site Reliability Engineers'
    #    - 'slug': 'acme:site-reliability-engineers'
    #    - 'both': 'acme:Site Reliability Engineers', 'acme:site-reliability-engineers'
    teamNameField: slug

    # Required ONLY for GitHub Enterprise.
    # This is the Hostname of the GitHub Enterprise account listed on the
    # management console. Ensure this domain is routable on your network.
    hostName: git.example.com

    # ONLY for GitHub Enterprise. Optional field.
    # Used to support self-signed or untrusted CA root certificates.
    rootCA: /etc/dex/ca.crt
```

### Generate TLS assets

Running Dex with HTTPS enabled requires a valid SSL certificate, and the API server needs to trust the certificate of the signing CA using the `--oidc-ca-file` flag.

For our example use case, the TLS assets can be created using the following command:

```bash
$ ./examples/k8s/gencert.sh
```

This will generate several files under the `ssl` directory, the important ones being `cert.pem` ,`key.pem` and `ca.pem`. The generated SSL certificate is for 'dex.example.com', although you could change this by editing `gencert.sh` if required.

### Run example client app with GitHub config

```bash
./bin/example-app --issuer-root-ca examples/k8s/ssl/ca.pem
```

1. Open browser to http://127.0.0.1:5555
2. Click Login
3. Select Log in with GitHub and grant access to dex to view your profile

[github-oauth2]: https://github.com/settings/applications/new
[github-orgs]: https://developer.github.com/v3/orgs/
[github-request-org-access]: https://help.github.com/articles/requesting-organization-approval-for-oauth-apps/
[github-approve-org-access]: https://help.github.com/articles/approving-oauth-apps-for-your-organization/
