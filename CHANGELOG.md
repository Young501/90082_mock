# Changelog

All notable changes to UniConnected will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [unreleased]

### Added

- Removed Folder from navigation. Instead now it is scoped to opportunities.
- Subscription now links to magento university product listing.

---

## [v1.2]

### Added

- Added ABN validation for organisations: The onboarding and profile editor now include an ABN lookup field with inline status messages. The system automatically verifies the ABN and organisation name before allowing users to continue or save changes, ensuring all organisations have a confirmed and valid ABN.
- Deprecated the opportunity invite flow. Now users can enrol in the invited opporutnity through the discover page.

---

## [1.1]

### Added

- Discover dropdown feature with responsive design, enrollment-status badges, and new useAccessibleOpportunities hook using the /api/v2/opportunities/all/ endpoint.
- Now Discover page's Enroll button takes users to a 4-page application flow with Start, Fill, Review, and Complete.
- When enroled is pressed, we check user domain and see if it fits within the allowed domain of the opporutnity. If it doesn't then we display a warning popup and we do not allow the user to enrol.
- My Opportunities tab on the Profile page, including enrolled/closed sub-tabs, dynamic badges, expandable opportunity cards, questionnaire editing, enrollment management (re-enroll, cancel, save changes), and responsive UX with loading states and toast notifications.

---

## [1.0.4]

### Added

- Now we show Within x km in the student profile

---

## [1.0.3]

### Added

- Cleaned up the auth sign up validation schema
- Now coordinator can view full profiles of students and organisations.

---

## [1.0.2] -2025-09-07

### Added

- Full card for student now doesn't show Opportuntiy Answers in profile page preview.
- Fixed the design of the Opportunity Answers in full card.
- Now Students that are matched will appear in discover but their cards are unclickable, and it will say "Not Available"

---

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
