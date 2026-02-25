---
title: Dex
---
## Why Dex?

Dex is a powerful OpenID Connect provider that acts as a gateway between your applications and identity providers.

### 🔗 Integrate Everything

Connect any service to Dex through OIDC - your entire platform uses a single authentication layer. Once integrated, seamlessly add any identity provider without touching your application code.

### ☸️ Kubernetes Native

Built for cloud-native environments. Runs perfectly in Kubernetes with minimal configuration.

### ✓ Production Ready

Used by organizations worldwide. Standards-based, flexible, and battle-tested.


### ⚡ Wide Provider Support

Dex connects to **LDAP**, **SAML**, **OAuth2**, **GitHub**, **Google**, and many more. Your applications only implement OIDC while Dex handles upstream complexity.

## Supported Identity Providers

<div class="providers-grid">
  <a href="/docs/connectors/github/" class="provider-card">
    <i class="fab fa-github fa-3x"></i>
    <h4>GitHub</h4>
  </a>
  <a href="/docs/connectors/google/" class="provider-card">
    <i class="fab fa-google fa-3x"></i>
    <h4>Google</h4>
  </a>
  <a href="/docs/connectors/microsoft/" class="provider-card">
    <i class="fab fa-microsoft fa-3x"></i>
    <h4>Microsoft</h4>
  </a>
  <a href="/docs/connectors/ldap/" class="provider-card">
    <i class="fas fa-id-card fa-3x"></i>
    <h4>LDAP</h4>
  </a>
  <a href="/docs/connectors/saml/" class="provider-card">
    <i class="fas fa-key fa-3x"></i>
    <h4>SAML</h4>
  </a>
  <a href="/docs/connectors/oidc/" class="provider-card">
    <i class="fas fa-unlock-alt fa-3x"></i>
    <h4>OpenID Connect</h4>
  </a>
  <a href="/docs/connectors/gitlab/" class="provider-card">
    <i class="fab fa-gitlab fa-3x"></i>
    <h4>GitLab</h4>
  </a>
  <a href="/docs/connectors/linkedin/" class="provider-card">
    <i class="fab fa-linkedin fa-3x"></i>
    <h4>LinkedIn</h4>
  </a>
  <a href="/docs/connectors/atlassian-crowd/" class="provider-card">
    <i class="fab fa-atlassian fa-3x"></i>
    <h4>Atlassian</h4>
  </a>
  <a href="/docs/connectors/gitea/" class="provider-card">
    <i class="fas fa-code-branch fa-3x"></i>
    <h4>Gitea</h4>
  </a>
  <a href="/docs/connectors/oauth/" class="provider-card">
    <i class="fas fa-shield-alt fa-3x"></i>
    <h4>OAuth 2.0</h4>
  </a>
  <a href="/docs/connectors/authproxy/" class="provider-card">
    <i class="fas fa-network-wired fa-3x"></i>
    <h4>AuthProxy</h4>
  </a>
</div>
<div class="providers-more">
  <a href="/docs/connectors/" class="btn-more-providers">View all connectors →</a>
</div>

## Use Cases
<div class="use-cases-grid">
  <div class="use-case-card">
    <div class="use-case-icon">🔐</div>
    <h3>Unified Platform Authentication</h3>
    <p>Integrate all your services and applications with Dex once. Then add identity providers (LDAP, SAML, OIDC) without modifying any application code.</p>
  </div>
  <div class="use-case-card">
    <div class="use-case-icon">📦</div>
    <h3>Deploy as a Dependency</h3>
    <p>Dex is lightweight and can be deployed alongside your application. Your platform immediately supports authentication through dozens of providers.</p>
  </div>
  <div class="use-case-card">
    <div class="use-case-icon">☸️</div>
    <h3>Kubernetes Authentication</h3>
    <p>Provide seamless SSO for your Kubernetes dashboard and internal tools.</p>
  </div>
  <div class="use-case-card">
    <div class="use-case-icon">🧪</div>
    <h3>Development and Testing</h3>
    <p>Built-in mock provider for testing during development.</p>
  </div>
</div>

## Getting Started
**[📖 Installation Guide](/docs/getting-started/)** • **[⚙️ Configuration](/docs/configuration/)** • **[🔌 Connectors](/docs/connectors/)**

<div class="cncf-badge">
<img src="/img/logos/cncf-color.png" alt="CNCF" style="height: 60px; margin-bottom: 1rem;">
<br>
Dex is a <strong>Cloud Native Computing Foundation</strong> sandbox project.
</div>
