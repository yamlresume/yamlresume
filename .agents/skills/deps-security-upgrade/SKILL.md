---
name: deps-security-upgrade
description: Triage GitHub Dependabot alerts and remediate pnpm dependency vulnerabilities safely. Classify runtime versus development exposure, check whether vulnerable features are reachable, apply targeted direct and transitive updates, prune obsolete overrides, validate the repository, and prepare reviewable commits. Use when the user asks to inspect or fix Dependabot alerts, dependency security warnings, vulnerable packages, pnpm audit findings, or stale dependency overrides.
argument-hint: "[owner/repo]"
---

# Dependency security upgrade

Triage and remediate dependency alerts without hiding risk. Prefer targeted
updates and evidence-based disposition over bulk upgrades, broad overrides, or
mass dismissal.

Default to the current repository when no `owner/repo` is supplied. Do not
commit, push, dismiss alerts, or otherwise change remote state unless the user
asks. Preserve unrelated working-tree changes.

## 1. Inspect the repository and alerts

Check the worktree before changing dependencies:

```sh
git status --short
gh --version
```

List open Dependabot alerts with their dependency metadata:

```sh
gh api --paginate \
  'repos/{owner}/{repo}/dependabot/alerts?state=open&per_page=100' \
  --jq '.[] | [
    .number,
    .security_advisory.severity,
    .security_vulnerability.package.name,
    .dependency.scope,
    .dependency.relationship,
    .dependency.manifest_path,
    .security_vulnerability.vulnerable_version_range,
    (.security_vulnerability.first_patched_version.identifier // "none"),
    .security_advisory.summary,
    .html_url
  ] | @tsv'
```

A 403 or 404 can mean the current account cannot read security alerts. Report
permission problems instead of treating them as an empty alert list.

## 2. Triage before upgrading

Group alerts by package and fixed version; several alerts often have one fix.
For each group:

1. Confirm the installed version falls in the vulnerable range.
2. Trace every dependency path:

   ```sh
   pnpm why -r <package>
   ```

3. Classify the exposure:
   - **Production/runtime:** shipped or executed by consumers.
   - **Development-only:** tests, documentation, commit tooling, or local dev
     servers. This is lower exposure, not automatically a false positive.
   - **Conditional:** the package is present, but the advisory requires a
     feature or configuration that may not be used.
4. Inspect relevant imports and call sites for conditional alerts. Check for
   vendored or bundled copies; updating an npm dependency may not update code
   embedded in a parent package.
5. Separate version-based findings from reachability. Do not call an alert a
   false positive merely because it is transitive or development-only.

Summarize the alert numbers, current and patched versions, dependency paths,
reachability evidence, and proposed disposition before making changes when the
user asked only for analysis.

## 3. Apply targeted updates

Prefer the smallest updates that reach patched versions. Avoid running
`pnpm up -r --latest` unless the user explicitly wants unrelated major
upgrades.

Update direct dependencies and enforce a minimum patched range:

```sh
pnpm up -r <package>@^<patched-version>
```

Update transitive dependencies through the existing parent ranges:

```sh
pnpm up -r --depth 1000 <package>
```

Then inspect the result:

```sh
pnpm why -r <package>
git diff -- package.json 'packages/*/package.json' pnpm-lock.yaml
```

If a parent range excludes every patched release, prefer a compatible parent
upgrade. Use a targeted pnpm override only after checking API compatibility.
Never add an override solely to make an alert disappear, especially when the
parent vendors the vulnerable implementation.

## 4. Sunset obsolete overrides

Inspect `pnpm-workspace.yaml`, legacy `pnpm` fields in `package.json`, and Git
history before removing an override:

```sh
pnpm why -r <overridden-package>
git log --oneline -S '<overridden-package>' -- package.json pnpm-workspace.yaml
```

Remove an override only when the dependency is gone or the resolved dependency
tree remains patched without it. Regenerate the lockfile after removal:

```sh
pnpm install
```

Do not replace obsolete overrides with unnecessary new ones during the same
cleanup.

## 5. Verify remediation

Check lockfile consistency and resolved versions:

```sh
pnpm install --frozen-lockfile
pnpm why -r <updated-package>
pnpm audit
```

`pnpm audit` and Dependabot can report different advisory sets. Report every
remaining or newly discovered finding accurately; never hide a nonzero audit
exit. Distinguish the alerts addressed by the change from unrelated findings.

Run the repository's standard validation from `AGENTS.md`, normally:

```sh
pnpm check
pnpm build
pnpm test
pnpm test:e2e
```

Build before testing because workspace tests consume built package artifacts.
If source files changed, run the required coverage checks for affected packages
before committing. Do not claim success while any required command is failing.

## 6. Handle unresolved alerts carefully

Leave alerts with no safe upstream fix open while documenting the blocker. A
`not_used` dismissal requires concrete reachability evidence, such as an unused
CLI-only dependency path or an advisory-specific option that is never enabled.

Dismiss only when the user has authorized remote alert changes:

```sh
gh api --method PATCH \
  repos/{owner}/{repo}/dependabot/alerts/{alert-number} \
  -f state=dismissed \
  -f dismissed_reason=not_used \
  -f dismissed_comment='Document the unused feature and supporting code path'
```

Do not manually mark alerts as fixed. GitHub resolves fixed alerts after the
remediation reaches the default branch and Dependabot rescans the manifest.

## 7. Commit and report

Review the final diff and run `git diff --check`. Commit only when requested.
Use granular commits when each intermediate commit has consistent manifests and
lockfiles. If several changes share one lockfile and cannot be split safely,
keep one atomic commit rather than creating broken intermediate states. Do not
push unless asked.

Report:

- alert groups addressed and their resolved versions;
- removed or retained overrides;
- remaining conditional alerts and other audit findings;
- validation commands and their results;
- commit hash if created, and whether anything was pushed or dismissed.
