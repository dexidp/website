---
title: "Authentication using OpenShift"
linkTitle: "OpenShift"
description: ""
date: 2020-09-30
draft: false
toc: true
weight: 2110
---

## Overview

Dex can make use of users and groups defined within OpenShift by querying the platform provided OAuth server.

## Configuration


### Creating an OAuth Client

Two forms of OAuth Clients can be utilized:

* [Using a Service Account as an OAuth Client](https://docs.openshift.com/container-platform/latest/authentication/using-service-accounts-as-oauth-client.html) (Recommended)
* [Registering An Additional OAuth Client](https://docs.openshift.com/container-platform/latest/authentication/configuring-internal-oauth.html#oauth-register-additional-client_configuring-internal-oauth)

#### Using a Service Account as an OAuth Client

OpenShift Service Accounts can be used as a constrained form of OAuth client. Making use of a Service Account to represent an OAuth Client is the recommended option as it does not require elevated privileged within the OpenShift cluster. Create a new Service Account or make use of an existing Service Account.

Patch the Service Account to add an annotation for location of the Redirect URI

```bash
oc patch serviceaccount <name> --type='json' -p='[{"op": "add", "path": "/metadata/annotations/serviceaccounts.openshift.io~1oauth-redirecturi.dex", "value":"https://<dex_url>/callback"}]'
```

The Client ID for a Service Account representing an OAuth Client takes the form `system:serviceaccount:<namespace>:<service_account_name>`

Depending on your cluster configuration, you can use modern short-lived (projected) tokens or legacy static secrets.

##### Dynamic / Rotating Tokens
When using projected Service Account tokens, tokens are short-lived and automatically rotated on disk by the kubelet.
Use `clientSecretFile` to read the token directly from the mounted path so Dex automatically picks up rotated tokens without requiring pod restarts.

```yaml
connectors:
  - type: openshift
    id: openshift
    name: OpenShift
    config:
      issuer: https://api.mycluster.example.com:6443
      clientID: system:serviceaccount:dex:dex-server
      # Path to the file containing the projected token
      clientSecretFile: /var/run/secrets/kubernetes.io/serviceaccount/token
      redirectURI: http://127.0.0.1:5556/dex/callback
```

##### Manual Token Generation via `TokenRequest` API
If you cannot mount a projected volume and need to supply a token string directly in OpenShift 4.11 or later, generate a long-lived token manually using the below command:

```bash
oc create token <sa-name> -n <namespace> --duration=8760h
```

Pass the generated token string using clientSecret (or reference it through an environment variable):

```yaml
connectors:
  - type: openshift
    id: openshift
    name: OpenShift
    config:
      issuer: https://api.mycluster.example.com:6443
      clientID: system:serviceaccount:dex:dex-server
      # Service account token generated via TokenRequest API
      clientSecret: $OPENSHIFT_OAUTH_CLIENT_SECRET
      redirectURI: http://127.0.0.1:5556/dex/callback
```

##### Legacy Static Tokens
If your cluster uses non-expiring `Secret` objects linked to Service Accounts (common in OpenShift 4.10 and earlier), extract the token string directly from the Secret using the below command:

```bash
oc get secret <secret-name> -n <namespace> -o jsonpath='{.data.token}' | base64 --decode
```

Set the retrieved token directly in the Dex configuration or reference it through an environment variable:

The retrieved token can either be set in the dex configuration either directly in the `clientSecret` field or referenced through an environment variable.

```yaml
connectors:
  - type: openshift
    id: openshift
    name: OpenShift
    config:
      issuer: https://api.mycluster.example.com:6443
      clientID: system:serviceaccount:dex:dex-server
      # Service account token referenced through an environment variable
      clientSecret: $OPENSHIFT_OAUTH_CLIENT_SECRET
      redirectURI: http://127.0.0.1:5556/dex/callback
```

#### Registering An Additional OAuth Client

Instead of using a constrained form of Service Account to represent an OAuth Client, an additional OAuthClient resource can be created.

Create a new OAuthClient resource similar to the following:

```yaml
kind: OAuthClient
apiVersion: oauth.openshift.io/v1
metadata:
 name: dex
# The value that should be utilized as the `client_secret`
secret: "<clientSecret>"
# List of valid addresses for the callback. Ensure one of the values that are provided is `(dex issuer)/callback`
redirectURIs:
 - "https:///<dex_url>/callback"
grantMethod: prompt
```

### Dex Configuration

The following is an example of a configuration for `examples/config-dev.yaml`:

```yaml
connectors:
  - type: openshift
    # Required field for connector id.
    id: openshift
    # Required field for connector name.
    name: OpenShift
    config:
      # OpenShift API
      issuer: https://api.mycluster.example.com:6443
      # Credentials can be string literals or pulled from the environment.
      clientID: $OPENSHIFT_OAUTH_CLIENT_ID
      clientSecret: $OPENSHIFT_OAUTH_CLIENT_SECRET
      redirectURI: http://127.0.0.1:5556/dex/
      # Optional: Specify whether to communicate to OpenShift without validating SSL certificates
      insecureCA: false
      # Optional: The location of file containing SSL certificates to communicate to OpenShift
      rootCA: /etc/ssl/openshift.pem
      # Optional list of required groups a user must be a member of
      groups:
        - users
```
