---
title: "Releases"
description: ""
date: 2020-09-30
draft: false
toc: true
weight: 3100
---

Releasing a new version of Dex can be done by one of the core maintainers with push access to the
[git repository](https://github.com/dexidp/dex).
It's usually good to have an extra pair of eyes ready when tagging a new release though,
so feel free to ask a peer to be ready in case anything goes wrong or you need a review.

The release process is semi-automated at the moment: artifacts are automatically built and published to
GitHub Container Registry (primary source of container images) and Docker Hub.

The GitHub release needs to be manually created (use past releases as templates).

> *Note:* this will hopefully be improved in the future.


## Tagging a new release

Make sure you've [uploaded your GPG key](https://github.com/settings/keys) and
configured git to [use that signing key](
https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work) either globally or
for the Dex repo. Note that the email the key is issued for must be the email
you use for git.

```bash
git config [--global] user.signingkey "{{ GPG key ID }}"
git config [--global] user.email "{{ Email associated with key }}"
```

Create a signed tag at the commit you wish to release.

```bash
RELEASE_VERSION=v2.0.0
git tag -s -m "Release $RELEASE_VERSION" $RELEASE_VERSION # optionally: commit hash as the last argument
```

Push that tag to the Dex repo.

```bash
git push origin $RELEASE_VERSION
```

Draft releases on GitHub and summarize the changes since the last release.
See [previous releases](https://github.com/dexidp/dex/releases) for the expected format.


## Patch releases

Occasionally, patch releases might be necessary to fix an urgent bug or vulnerability.

First, check if there is a release branch for a minor release. Create one if necessary:

```bash
MINOR_RELEASE="v2.1.0"
RELEASE_BRANCH="v2.1.x"
git checkout -b $RELEASE_BRANCH tags/$MINOR_RELEASE
git push origin $RELEASE_BRANCH
```

If a patch version is needed (2.1.1, 2.1.2, etc.), checkout the desired release branch and cherry pick specific commits.

```bash
RELEASE_BRANCH="v2.1.x"
git checkout $RELEASE_BRANCH
git checkout -b "cherry-picked-change"
git cherry-pick (SHA of change)
git push origin "cherry-picked-change"
```

Open a PR onto `$RELEASE_BRANCH` to get the changes approved.

Continue with the regular release process.
