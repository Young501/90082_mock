# Changelog

All notable changes to UniConnected will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- Added checkboxes for privacy policy and Terms and Conditions for student and partner. These have to be checked for a user to be able to sign up.
- Added links to uniconnected logo in navbar

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
