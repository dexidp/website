---
title: Dex
---

<section class="band band--light">
<div class="container">

<p class="section-label"><span aria-hidden="true">§ 01 · </span>capability</p>

## Why Dex?

<p class="section-lead">A single authentication layer for your entire platform. Integrate any identity provider through OpenID Connect — without touching your application code.</p>

<div class="features-grid">
  <div class="feature-card">
    <span class="feature-label">// integrate</span>
    <h3>One protocol to rule them all</h3>
    <p>Every service speaks OIDC to Dex. Add upstream providers later without redeploying apps, reconfiguring clients, or rewriting auth code.</p>
  </div>
  <div class="feature-card">
    <span class="feature-label">// cloud-native</span>
    <h3>Built for Kubernetes</h3>
    <p>Lightweight binary, official Helm chart, minimal configuration. Runs alongside your workloads without drama.</p>
  </div>
  <div class="feature-card">
    <span class="feature-label">// production</span>
    <h3>Standards, not surprises</h3>
    <p>OIDC and OAuth2 all the way down. Battle-tested across organizations of every size, audited, and actively maintained.</p>
  </div>
  <div class="feature-card">
    <span class="feature-label">// federation</span>
    <h3>Any upstream you need</h3>
    <p>LDAP, SAML, GitHub, Google, GitLab, Microsoft — and more. Apps stay OIDC-only while Dex handles the mess upstream.</p>
  </div>
</div>

</div>
</section>

<section class="band band--muted">
<div class="container">

<p class="section-label"><span aria-hidden="true">§ 02 · </span>providers</p>

## Supported identity providers

<p class="section-lead">First-class connectors for the most common identity providers. Pick one — or wire several together.</p>

<div class="providers-grid">
  <a href="/docs/connectors/github/" class="provider-card">
    <i class="fab fa-github" aria-hidden="true"></i>
    <h4>GitHub</h4>
  </a>
  <a href="/docs/connectors/google/" class="provider-card">
    <i class="fab fa-google" aria-hidden="true"></i>
    <h4>Google</h4>
  </a>
  <a href="/docs/connectors/microsoft/" class="provider-card">
    <i class="fab fa-microsoft" aria-hidden="true"></i>
    <h4>Microsoft</h4>
  </a>
  <a href="/docs/connectors/gitlab/" class="provider-card">
    <i class="fab fa-gitlab" aria-hidden="true"></i>
    <h4>GitLab</h4>
  </a>
  <a href="/docs/connectors/linkedin/" class="provider-card">
    <i class="fab fa-linkedin" aria-hidden="true"></i>
    <h4>LinkedIn</h4>
  </a>
  <a href="/docs/connectors/atlassian-crowd/" class="provider-card">
    <i class="fab fa-atlassian" aria-hidden="true"></i>
    <h4>Atlassian</h4>
  </a>
  <a href="/docs/connectors/ldap/" class="provider-card">
    <i class="fas fa-id-card" aria-hidden="true"></i>
    <h4>LDAP</h4>
  </a>
  <a href="/docs/connectors/saml/" class="provider-card">
    <i class="fas fa-key" aria-hidden="true"></i>
    <h4>SAML</h4>
  </a>
  <a href="/docs/connectors/oidc/" class="provider-card">
    <i class="fas fa-unlock-keyhole" aria-hidden="true"></i>
    <h4>OpenID Connect</h4>
  </a>
  <a href="/docs/connectors/oauth/" class="provider-card">
    <i class="fas fa-shield-halved" aria-hidden="true"></i>
    <h4>OAuth 2.0</h4>
  </a>
  <a href="/docs/connectors/gitea/" class="provider-card">
    <i class="fas fa-code-branch" aria-hidden="true"></i>
    <h4>Gitea</h4>
  </a>
  <a href="/docs/connectors/authproxy/" class="provider-card">
    <i class="fas fa-network-wired" aria-hidden="true"></i>
    <h4>AuthProxy</h4>
  </a>
</div>

<div class="providers-more">
  <a href="/docs/connectors/" class="btn-more-providers">
    View all connectors
    <i class="fas fa-arrow-right" aria-hidden="true"></i>
  </a>
</div>

</div>
</section>

<section class="band band--light">
<div class="container">

<p class="section-label"><span aria-hidden="true">§ 03 · </span>use cases</p>

## Where teams ship Dex

<p class="section-lead">Four patterns we see most often in the wild.</p>

<div class="use-cases-grid">
  <div class="use-case-card">
    <span class="use-case-label">// platform</span>
    <h3>Unified platform auth</h3>
    <p>Integrate your services with Dex once. Add LDAP, SAML or OIDC providers later without touching a single application.</p>
  </div>
  <div class="use-case-card use-case-card--red">
    <span class="use-case-label">// bundled</span>
    <h3>Ship as a dependency</h3>
    <p>Lightweight enough to bundle next to your application. Your platform instantly supports auth via dozens of providers.</p>
  </div>
  <div class="use-case-card">
    <span class="use-case-label">// kubernetes</span>
    <h3>Kubernetes SSO</h3>
    <p>Seamless single sign-on for the dashboard, internal tools, and the kubectl flow — one OIDC endpoint to trust.</p>
  </div>
  <div class="use-case-card use-case-card--red">
    <span class="use-case-label">// local-dev</span>
    <h3>Development & testing</h3>
    <p>Built-in mock connector lets you authenticate locally during development without provisioning real identities.</p>
  </div>
</div>

</div>
</section>

<section class="band band--muted">
<div class="container">

<p class="section-label"><span aria-hidden="true">§ 04 · </span>positioning</p>

## How Dex compares

<p class="section-lead">Dex is one of many OIDC providers in the ecosystem. Here's where it intentionally stops, and where you'd reach for something else.</p>

<div class="vs-grid">
  <div class="vs-card">
    <span class="vs-label">vs Keycloak</span>
    <h3>No JVM, no database required</h3>
    <p>Keycloak is a heavy Java application that requires a backing database. Dex is a single static Go binary; storage is pluggable and optional.</p>
  </div>
  <div class="vs-card">
    <span class="vs-label">vs Ory Hydra</span>
    <h3>Login flow and connectors included</h3>
    <p>Hydra is a headless OAuth2/OIDC server: it redirects the user to a login app <em>you</em> write, which then calls Hydra's admin API to accept consent. Dex ships the login UI and upstream connectors (LDAP, SAML, GitHub, OIDC) in one process.</p>
  </div>
  <div class="vs-card">
    <span class="vs-label">vs Authelia / OAuth2 Proxy</span>
    <h3>Protocol provider, not a gateway</h3>
    <p>Both sit at the HTTP layer and protect upstream routes via ForwardAuth headers — they're reverse-proxy companions. Dex is a full OIDC issuer; any standards-compliant client runs the authorization-code flow against it directly.</p>
  </div>
  <div class="vs-card">
    <span class="vs-label">vs Zitadel</span>
    <h3>Protocol adapter, not a data plane</h3>
    <p>Zitadel is an event-sourced IAM platform — it owns users, organisations, projects and audit logs on CockroachDB. Dex owns no user state at all: it takes an upstream identity source (LDAP, GitHub, SAML) and re-exposes it as OIDC.</p>
  </div>
  <div class="vs-card">
    <span class="vs-label">vs Authentik</span>
    <h3>Federates upstream, doesn't replace it</h3>
    <p>Authentik is a Python/Django application with its own user store, flows engine and admin UI. Dex has no user store — authentication is delegated to whatever IdP you already run, and Dex translates the response into standard OIDC claims.</p>
  </div>
  <div class="vs-card">
    <span class="vs-label">vs Cognito / GCP Identity</span>
    <h3>Runs on your infrastructure</h3>
    <p>Managed IAM binds your auth path to one cloud's APIs, billing and outage surface. Dex runs as a Kubernetes deployment, a systemd unit or a container on any substrate. User data and audit logs stay inside your network.</p>
  </div>
</div>

</div>
</section>

<section class="band band--light">
<div class="container">

<p class="section-label"><span aria-hidden="true">§ 05 · </span>getting started</p>

## Three steps to running

<p class="section-lead">From zero to a working federated identity service.</p>

<div class="steps-grid">
  <a href="/docs/getting-started/" class="step-card">
  <div>
    <h3>Install</h3>
    <p>Pull the container image, deploy the Helm chart, or build from source. Dex runs anywhere Go runs.</p>
    <span class="step-link">installation guide →</span>
  </div>
  </a>
  <a href="/docs/configuration/" class="step-card">
  <div>
    <h3>Configure</h3>
    <p>Define clients, storage and connectors in a single YAML file. Templated values supported out of the box.</p>
    <span class="step-link">configuration reference →</span>
  </div>
  </a>
  <a href="/docs/connectors/" class="step-card">
  <div>
    <h3>Connect</h3>
    <p>Wire up GitHub, Google, LDAP, SAML — or any of the dozens of connectors Dex supports.</p>
    <span class="step-link">browse connectors →</span>
  </div>
  </a>
</div>

<div class="cncf-section">
  <div class="cncf-card">
    <img src="/img/logos/cncf-color.png" alt="Cloud Native Computing Foundation" class="cncf-logo-light no-wrap">
    <img src="/img/logos/cncf-white.png" alt="Cloud Native Computing Foundation" class="cncf-logo-dark no-wrap">
    <p class="cncf-card-text">
      <strong>CNCF Sandbox Project</strong>
      Dex is developed under the Cloud Native Computing Foundation — following CNCF governance and best practices.
    </p>
  </div>
</div>

</div>
</section>
