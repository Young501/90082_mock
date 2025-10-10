---
name: Staging QC Checklist – UniConnected
about:
  Use this checklist to verify staging before promoting a release to production.
  Tick off each item as it’s tested and passes.
title: ""
labels: ""
assignees: ""
---

## 🔑 Authentication & Account Access

- [ ] Sign up works (all user types)
- [ ] Email verification flow completes
- [ ] Forgot password flow works (reset email, reset link)
- [ ] Login works (student, organisation member, coordinator)
- [ ] Change password works for all user types
- [ ] Token refresh works (no 401 loop, auto logout on expired token)

---

## 🧑‍🎓 Student Onboarding & Usage

- [ ] Student onboarding flow completes (questionnaire saved)
- [ ] Student Discover page loads organisations
- [ ] Student Discover filters work (incl. opportunity questionnaire filters)
- [ ] Student can add organisation to folder
- [ ] Student can remove organisation from folder
- [ ] Student profile page: update all fields (picture, location, resume upload, etc.)

---

## 🏢 Organisation Onboarding & Usage

- [ ] Organisation member onboarding – join **existing** organisation
- [ ] Organisation member onboarding – create **new** organisation (domain + org-specific questions)
- [ ] Organisation Discover page loads students
- [ ] Organisation Discover filters work (incl. opportunity questionnaire filters)
- [ ] Organisation folders: add students to folder
- [ ] Organisation folders: remove students from folder
- [ ] Organisation profile page: update all fields (logo, location, description, etc.)
- [ ] Organisation member profile: update personal fields

---

## 📋 Opportunities & Invitations

- [ ] Coordinator can create opportunity (MTSI, employment, etc.)
- [ ] Invite **student** who already exists → student receives invite & accepts
- [ ] Invite **student** who does not exist → invitation email, signup flow works
- [ ] Invite **organisation** that already exists → invitation works
- [ ] Invite **organisation** that does not exist → domain-based signup works
- [ ] Student sees relevant opportunities in Discover
- [ ] Coordinator dashboard shows opportunity participants correctly

---

## 👩‍💼 Coordinator Dashboard

- [ ] Tabs show correctly: “About You” / “About Your Organisation”
- [ ] Can invite students and organisations
- [ ] Questionnaire answers display properly
- [ ] Data updates (contact info, questionnaire changes) persist

---

## 📱 UI / UX & Responsiveness

- [ ] All key flows tested on **mobile** (onboarding, discover, profiles, invitations)
- [ ] All key flows tested on **tablet**
- [ ] Layouts responsive (no overlaps, icons aligned, text wraps correctly)
- [ ] Long website URLs display correctly with Globe icon
- [ ] File uploads (resume, profile picture, logo) work and render after upload

---

## ⚙️ System & Security

- [ ] Role-based redirects:
  - Student → `/discover`
  - Coordinator → `/dashboard`
  - Organisation → `/organisation`
- [ ] Permissions enforced (students cannot access org/coordinator dashboards, etc.)
- [ ] Error messages display cleanly (invalid login, invalid invite, etc.)
- [ ] Staging is protected (basic auth if enabled)

---

## 🚀 Smoke Tests (end-to-end)

- [ ] Homepage loads in < 3 seconds
- [ ] Student signs up → completes onboarding → joins opportunity
- [ ] Coordinator creates opportunity → invites organisation → organisation accepts
- [ ] Logout & re-login works without issue
- [ ] Refreshing pages preserves login/session state

---

## ✅ Sign-off

- [ ] QA approved
- [ ] PM / Coordinator approved
- [ ] Tech Lead approved
