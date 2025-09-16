# UniConnected Release Checklist

This document describes the steps for cutting a new release of UniConnected.

---

## 1. Prepare

- [ ] Ensure all required PRs are merged into **`staging`**.
- [ ] Run CI and confirm tests/lint/build are green.
- [ ] Update **CHANGELOG.md**:
  - Move items from **[Unreleased]** into a new version section.
  - Version format: `MAJOR.MINOR.PATCH` (e.g. `1.2.0`).
  - For staging release candidates, add `-rc.N` suffix.

---

## 2. Cut a Release Candidate (Staging)

```bash
git checkout staging
git pull origin staging
git tag -a vX.Y.Z-rc.1 -m "vX.Y.Z-rc.1 – candidate for release"
git push origin vX.Y.Z-rc.1
```

- Amplify will auto-deploy the updated `staging` branch.
- Share the preview/staging URL with QA/PM for testing.
- If fixes are needed, merge them into `staging` and create `-rc.2`, `-rc.3`, etc.

---

## 3. Promote to Production

When staging is approved:

```bash
git checkout main
git pull origin main
git merge --ff-only staging
git tag -a vX.Y.Z -m "vX.Y.Z – stable release"
git push origin main
git push origin vX.Y.Z
```

- Amplify will auto-deploy the `main` branch to production.
- Verify production deployment at https://app.uniconnected.com (or your prod domain).

---

## 4. Post-Release

- [ ] Confirm release notes were added to GitHub (optional: use `gh release create`).
- [ ] Monitor error tracking (Sentry, logs) for issues.
- [ ] Announce the release (Slack/Notion/Email as needed).
- [ ] Start collecting changes for the next `[Unreleased]` section in **CHANGELOG.md**.

---

## Notes

- **Versioning:**
  - MAJOR = breaking changes
  - MINOR = new features
  - PATCH = fixes
- **Rollback:**
  - In Amplify → Hosting → Deployments, redeploy the previous build.
  - In Git: revert commits or deploy previous tag (`git checkout vX.Y.Z`).
