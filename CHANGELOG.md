# Changelog

All notable changes to UniConnected will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [unreleased - UC-310]

### Added

- **My Opportunities tab on Profile page**

  - **Navigation & Layout**:
    - Added "My Opportunities" tab to Profile page navigation
    - Two sub-tabs: "Enrolled Opportunities" and "Closed Opportunities"
    - Dynamic tab counts with color-coded badges

  - **Data Fetching & Categorization**:
    - `useAllOpportunities` hook to fetch all opportunities with enrollment status
    - Automatic participant record fetching for each opportunity

  - **Opportunity Cards**:
    - Expandable cards showing opportunity details
    - Participant information display (status, enrollment date)
    - Questionnaire answers rendering using existing `FieldRenderer` components
    - Edit mode for questionnaire answers with form validation

  - **Enrollment Management**:
    - **Re-enrollment**: Complete questionnaire and re-enroll from Closed opportunities
    - **Cancel Enrollment**: One-click cancellation from Enrolled opportunities
    - **Save Changes**: Update questionnaire answers with optimistic updates
    - Success/error toast notifications for all actions

  - **UX/State Improvements**:
    - Skeleton loading screens for opportunity lists
    - Spinner loading for expand panels
    - Clean empty states: "You're not enrolled in any opportunities yet." / "No closed opportunities."
    - Chakra UI Alert components for error handling
    - Responsive design with proper mobile support

  - **API Integration**:
    - `GET /api/v2/opportunities/all/` for fetching all opportunities
    - `GET /api/v2/opportunities/{id}/participant/` for participant records
    - `PATCH /api/v2/opportunities/{id}/participant/{participant_id}/` for updating answers
    - `POST /api/v2/opportunities/{id}/participant/` for re-enrollment
    - `DELETE /api/v2/opportunities/{id}/participant/` for canceling enrollment

### Fixed

- **My Opportunities data consistency**:
  - Ensured canceled opportunities remain visible in DISCOVER dropdown menu

---

## [unreleased - UC-326]

### Added

- **Discover dropdown navigation**

  - Dynamic states depending on accessible opportunities:
    - **0 items** → Discover disabled, clicking shows toast _“No opportunities yet.”_
    - **1 item** → direct link to the single opportunity page.
    - **2+ items** → dropdown listing all opportunities with name + status badge (Enrolled / Not Enrolled).
  - **Mobile support**: collapsible list inside hamburger menu.
  - **Status badges**: green for _Enrolled_, gray for _Not Enrolled_.
  - **Responsive design**: desktop popover dropdown, mobile stacked list.

- **API integration**

  - Added `GET /api/v2/opportunities/all/` endpoint (`OPPORTUNITIES_ALL_V2`) to retrieve accessible opportunities (UC-314).

- **Hook `useAccessibleOpportunities`**

  - Unified type mapping for v1 and v2 data.
  - Automatic fallback to v1 endpoint if v2 fails.
  - Environment variable (`NEXT_PUBLIC_OPPS_SOURCE`) to force v1 testing.
  - React Query caching (5 min), 404 non-retry, user-dependent enable.

- **Routing adaptation**

  - Replaced dynamic route `/discover/[id]` with query param `/discover/?id={id}` for static export compatibility.

- **Header refactor**

  - Three-state rendering (disabled / single link / dropdown).
  - Outside-click handler for closing dropdown.

- **Mock opportunities** created for testing the dropdown behavior.

### Fixed

- Organisation profile page infinite loading spinner: resolved by ensuring correct query handling and preventing endless state loops.

### Changed

- Auth hook: now invalidates `["accessible-opportunities"]` cache key on login success to refresh Discover menu.
- useDiscovery hook: enhanced to support overriding current opportunity ID via parameter.
- Header component: restructured to consume `useAccessibleOpportunities` and handle responsive dropdown rendering.
- Fallback logic: v2 failures auto-fallback to v1 accepted opportunities, mapped into a consistent format.

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
