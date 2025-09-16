# Changelog

All notable changes to UniConnected will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

---

## [1.0.2] -2025-09-11

### Added

Discover navigation: turned into a dropdown listing accessible opportunities

0 items → Discover disabled; clicking shows toast “No opportunities yet.”

1 item → plain link to the single opportunity

2+ items → dropdown with name + status badge (Enrolled / Not Enrolled), click → /discover/{id}

Mobile responsive: collapsible within header menu

---

Changed

Core backend refactor (Django): organisation models

Frontend routing: redirect based on user type (/dashboard vs /discover)

Opportunities retrieval: on auth/login (and whenever auth state changes), app now calls
GET /api/v2/opportunities/all (UC-314) to fetch opportunities and render Discover menu with correct statuses

## [1.0.1] -2025-09-05

### Added

- Added checkboxes for privacy policy and Terms and Conditions for student and partner. These have to be checked for a user to be able to sign up.
- Now organisation full card displays the role of the organisation member.
- Added validation for the organisation email address.

---

## [1.0.0] - 2025-08-26

### Added

- Split between **Organisation** and **Partner** user types
- Organisation onboarding flow with industry/sector types
- Support for Master of Teaching (Secondary) Internship (MTSI) opportunities
- Invitation system for students and organisations
- Coordinator dashboard basics

### Changed

- Core backend refactor (Django): organisation models
- Frontend routing: redirect based on user type (`/dashboard` vs `/discover`)

---
