---
title: "Templates"
description: ""
date: 2020-09-30
toc: true
weight: 1100
---

## Using your own templates

Dex supports using your own templates and passing arbitrary data to them to help customize your installation.

Steps:

1. Copy contents of the `web` directory over to a new directory.
1. Customize the templates as needed, be sure to retain all the existing variables so Dex continues working correctly.
  (Use the following syntax to render values from `frontend.extra` config: `{{ "your_key" | extra }}`)
1. Set the `frontend.dir` value to your own `web` directory (Alternatively, you can set the `DEX_FRONTEND_DIR` environment variable).
1. Add your custom data to the Dex configuration `frontend.extra`. (optional)
1. Change the issuer by setting the `frontend.issuer` config in order to modify the Dex title and the `Log in to <<dex>>` tag. (optional)
1. Create a custom theme for your templates in the `themes` directory. (optional)

Here is an example configuration:

```yaml
frontend:
  dir: /path/to/custom/web
  issuer: my-dex
  extra:
    tos_footer_link: "https://example.com/terms"
    client_logo_url: "../theme/client-logo.png"
    foo: "bar"
```

To test your templates simply run Dex with a valid configuration and go through a login flow.


## Customize the official container image

Dex is primarly distributed as a container image.
The above guide explains how to customize the templates for any Dex instance.

You can combine that with a custom `Dockerfile` to ease the deployment of those custom templates:

```dockerfile
FROM ghcr.io/dexidp/dex:latest

ENV DEX_FRONTEND_DIR=/srv/dex/web

COPY --chown=root:root web /srv/dex/web
```

Using the snippet above, you can avoid setting the `frontend.dir` config.
