---
title: "Kubernetes Authentication Through Dex"
linkTitle: "Using Kubernetes with Dex"
description: ""
date: 2020-09-30
draft: false
toc: true
weight: 1070
---

## Overview

This document covers setting up the [Kubernetes OpenID Connect token authenticator plugin][k8s-oidc] with dex.
It also contains a worked example showing how the Dex server can be deployed within Kubernetes.

Token responses from OpenID Connect providers include a signed JWT called an ID Token. ID Tokens contain names, emails, unique identifiers, and in dex's case, a set of groups that can be used to identify the user. OpenID Connect providers, like dex, publish public keys; the Kubernetes API server understands how to use these to verify ID Tokens.

The authentication flow looks like:

1. OAuth2 client logs a user in through dex.
2. That client uses the returned ID Token as a bearer token when talking to the Kubernetes API.
3. Kubernetes uses dex's public keys to verify the ID Token.
4. A claim designated as the username (and optionally group information) will be associated with that request.

Username and group information can be combined with Kubernetes [authorization plugins][k8s-authz], such as role based access control (RBAC), to enforce policy.

## Configuring Kubernetes

Things to know before the start: 

* Dex has to be running on HTTPS.
  * Custom CA files must be accessible by the API server.
* Dex must be accessible to both your browser and the Kubernetes API server.
* The API server doesn't require dex to be available upfront.
  * Other authenticators, such as client certs, can still be used.
  * Dex doesn't need to be running when you start your API server.
* If a claim other than "email" is used for the username, for example, "sub", it will be prefixed by `"issuer-url"`. This is to namespace user-controlled claims which may be used for privilege escalation.
* The `/etc/ssl/certs/openid-ca.pem` used here is the CA from the [generated TLS assets](#generate-tls-assets), and is assumed to be present on the cluster nodes.

**Flow:** 

At the beginning, kube-apiserver will fetch Dex keys to validate signatures of bearer tokens. When there is a bearer token in the request, kube-apiserver:

1. Checks the token signature.
2. Makes an expiration check.
3. Validates claims (aud, iss).
4. Gets subject attributes from token claims.

Starting from Kubernetes v1.30.x, there are two options to connect Dex to your Kubernetes cluster:

### Using StructuedAuthenticationConfiguration

This is a structured configuration file that can be used to set up authenticator that will use Dex to validate incoming bearer tokens. You can find details about all the options and how the authenticator works by following [this link][structured-auth-config].

Steps to connect Dex:

1. Create a configuration file with the following content:

```yaml
# apiVersion can ends with the v1 / v1beta1 or v1alpah1 depending on your Kubernetes version
apiVersion: apiserver.config.k8s.io/v1beta1
kind: AuthenticationConfiguration
jwt:
- issuer:
    url: https://dex.example.com:32000
    audiences:
    - example-app
    # cat /etc/ssl/certs/openid-ca.pem | base64 -w0
    certificateAuthority: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
  claimMappings:
    username:
      claim: email
    groups:
      claim: groups
  userValidationRules:
  - expression: "!user.username.startsWith('system:')"
    message: "username cannot use reserved system: prefix"
```

2. Use the `--authentication-config=/path-to-your-config` flag for the `kube-apiserver` to apply the config.

### Using the OpenID Connect authenticator

Configuring the API server to use the OpenID Connect [authentication plugin][k8s-oidc] is possible for all Kubernetes versions.

Use the following flags to point your API server(s) at Dex. `dex.example.com` should be replaced by whatever DNS name or IP address Dex is running under.

```bash
--oidc-issuer-url=https://dex.example.com:32000
--oidc-client-id=example-app
--oidc-ca-file=/etc/ssl/certs/openid-ca.pem
--oidc-username-claim=email
--oidc-groups-claim=groups
```

Additional notes:
* Kubernetes configured with the `oidc` flags can only trusts ID Tokens issued to a single client.
  * As a workaround dex allows clients to [trust other clients][trusted-peers] to mint tokens on their behalf.

## Deploying dex on Kubernetes

The dex repo contains scripts for running dex on a Kubernetes cluster with authentication through GitHub. The dex service is exposed using a [node port][node-port] on port 32000. This likely requires a custom `/etc/hosts` entry pointed at one of the cluster's workers.

Because dex uses [CRDs](https://kubernetes.io/docs/tasks/access-kubernetes-api/custom-resources/custom-resource-definitions/) to store state, no external database is needed. For more details see the [storage documentation](/docs/configuration/storage/#kubernetes-custom-resource-definitions-crds).

There are many different ways to spin up a Kubernetes development cluster, each with different host requirements and support for API server reconfiguration. At this time, this guide does not have copy-pastable examples, but can recommend the following methods for spinning up a cluster:

* [coreos-kubernetes][coreos-kubernetes] repo for vagrant and VirtualBox users.
* [coreos-baremetal][coreos-baremetal] repo for Linux QEMU/KVM users.

To run dex on Kubernetes perform the following steps:

1. Generate TLS assets for dex.
2. Spin up a Kubernetes cluster with the appropriate flags and CA volume mount.
3. Create secrets for TLS and for your [GitHub OAuth2 client credentials][github-oauth2].
4. Deploy dex.

### Generate TLS assets

Running Dex with HTTPS enabled requires a valid SSL certificate, and the API server needs to trust the certificate of the signing CA using the `--oidc-ca-file` flag.

For our example use case, the TLS assets can be created using the following command:

```bash
$ cd examples/k8s
$ ./gencert.sh
```

This will generate several files under the `ssl` directory, the important ones being `cert.pem` ,`key.pem` and `ca.pem`. The generated SSL certificate is for 'dex.example.com', although you could change this by editing `gencert.sh` if required.

### Configure the API server

#### Ensure the CA certificate is available to the API server


The CA file which was used to sign the SSL certificates for Dex needs to be copied to a location where the API server can read it, and the API server configured to look for it with the flag `--oidc-ca-file`.

There are several options here but if you run your API server as a container probably the easiest method is to use a [hostPath](https://kubernetes.io/docs/concepts/storage/volumes/#hostpath) volume to mount the CA file directly from the host.

The example pod manifest below assumes that you copied the CA file into `/etc/ssl/certs`. Adjust as necessary:

```yaml
spec:
  containers:

    [...]

    volumeMounts:
    - mountPath: /etc/ssl/certs
      name: etc-ssl-certs
      readOnly: true

    [...]

  volumes:
   - name: ca-certs
     hostPath:
       path: /etc/ssl/certs
       type: DirectoryOrCreate
```

Depending on your installation you may also find that certain folders are already mounted in this way and that you can simply copy the CA file into an existing folder for the same effect.

#### Configure API server flags

Configure the API server as in [Configuring the OpenID Connect Plugin](#configuring-the-openid-connect-plugin) above.

Note that the `ca.pem` from above has been renamed to `openid-ca.pem` in this example - this is just to separate it from any other CA certificates that may be in use.

### Create cluster secrets

Once the cluster is up and correctly configured, use kubectl to add the serving certs as secrets.

```bash
$ kubectl -n dex create secret tls dex.example.com.tls --cert=ssl/cert.pem --key=ssl/key.pem
```

Then create a secret for the GitHub OAuth2 client.

```bash
$ kubectl -n dex create secret \
    generic github-client \
    --from-literal=client-id=$GITHUB_CLIENT_ID \
    --from-literal=client-secret=$GITHUB_CLIENT_SECRET
```

### Deploy the Dex server

Create the dex deployment, configmap, and node port service. This will also create RBAC bindings allowing the Dex pod access to manage [Custom Resource Definitions](/docs/configuration/storage/#kubernetes-custom-resource-definitions-crds) within Kubernetes.

```bash
$ kubectl create -f dex.yaml
```

## Logging into the cluster

The `example-app` can be used to log into the cluster and get an ID Token. To build the app, run the following commands:

```bash
cd examples/example-app
go install .
```

To build the `example-app` requires at least a 1.7 version of Go.

```bash
$ example-app --issuer https://dex.example.com:32000 --issuer-root-ca examples/k8s/ssl/ca.pem
```

Please note that the `example-app` will listen at http://127.0.0.1:5555 and can be changed with the `--listen` flag.

Once the example app is running, open a browser and go to http://127.0.0.1:5555

A page appears with fields such as scope and client-id. For the most basic case these are not required, so leave the form blank. Click login.

On the next page, choose the GitHub option and grant access to dex to view your profile.

The default redirect uri is http://127.0.0.1:5555/callback and can be changed with the `--redirect-uri` flag and should correspond with your configmap.

Please note the redirect uri is different from the one you filled when creating `GitHub OAuth2 client credentials`.
When you login, GitHub first redirects to dex (https://dex.example.com:32000/callback), then dex redirects to the redirect uri of example-app.

The printed "ID Token" can then be used as a bearer token to authenticate against the API server.

```bash
$ token='(id token)'
$ curl -H "Authorization: Bearer $token" -k https://( API server host ):443/api/v1/nodes
```

In the kubeconfig file ~/.kube/config, the format is:
```yaml
users:
- name: (USERNAME)
  user:
    token: (ID-TOKEN)
```

[k8s-authz]: https://kubernetes.io/docs/reference/access-authn-authz/authorization/
[k8s-oidc]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens
[trusted-peers]: https://godoc.org/github.com/dexidp/dex/storage#Client
[coreos-kubernetes]: https://github.com/coreos/coreos-kubernetes/
[coreos-baremetal]: https://github.com/coreos/coreos-baremetal/
[github-oauth2]: https://github.com/settings/applications/new
[node-port]: https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport
[coreos-kubernetes]: https://github.com/coreos/coreos-kubernetes
[coreos-baremetal]: https://github.com/coreos/coreos-baremetal
[structured-auth-config]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/#using-authentication-configuration
