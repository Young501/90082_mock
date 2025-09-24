# Employment Opportunity Questionnaire

This feature implements a 4-step questionnaire flow for enrolling in opportunities.

## Pages

### 1. Start (`/opportunities/start?id=123`)
- Shows opportunity title and description
- Provides introduction screen with CTA to begin
- Handles cases with and without questionnaires
- Routes to `/opportunities/fill` if questionnaire exists, otherwise directly to review

### 2. Fill (`/opportunities/fill?id=123`)
- Renders questionnaire using existing `QuestionnaireForm.tsx` and `FieldRenderer`
- Shows progress indicator
- Validates fields in real-time
- Persists answers in sessionStorage using the custom `useQuestionnaireAnswers` hook
- Routes to `/opportunities/review` on successful validation

### 3. Review (`/opportunities/review?id=123`)
- Displays read-only summary of all answers
- Provides option to edit (goes back to Fill page)
- Handles submission to API endpoint
- Clears stored answers on successful submission

### 4. Complete (`/opportunities/complete?id=123`)
- Shows success message
- Provides next steps information
- Links back to opportunity and profile pages

## API Integration

### Enrollment Endpoint
- **POST** `/api/v2/opportunities/{opportunity_id}/participant/`
- **Payload**: 
  ```json
  {
    "email": "user@example.com",
    "user_type": "student",
    "questionnaire_answers": { ... }
  }
  ```

### Error Handling
- `201/200` → Success, route to Complete
- `409` → Already enrolled, show message and redirect to discover
- `403` → Private invite missing, show error
- `401` → Redirect to login
- `400` → Display inline errors

## State Management

### `useQuestionnaireAnswers` Hook
- Manages questionnaire state across pages
- Automatically persists to sessionStorage
- Provides methods to update and clear answers
- Storage key format: `questionnaire_answers_{opportunityId}`

### `useOpportunityEnrollment` Hook
- Handles enrollment API calls
- Invalidates relevant queries on success
- Provides loading states and error handling

## Components Used

- **QuestionnaireForm** - Renders form fields with validation
- **FieldRenderer** - Handles different field types
- **Button (from UI components)** - Consistent button styling
- **Progress** - Shows completion progress
- **Alert** - Error and status messages

## Features

✅ Responsive and accessible UI using design system components  
✅ Persists answers across steps and browser refresh  
✅ Shows loading skeletons and error states  
✅ Real-time field validation  
✅ Proper error handling for all API response codes  
✅ Clears stored data on successful submission  
✅ Route parameter reading (`/opportunities/start/?id=123`)  

## Routes

- `/opportunities/start?id={opportunityId}` - Start page
- `/opportunities/fill?id={opportunityId}` - Fill questionnaire
- `/opportunities/review?id={opportunityId}` - Review answers
- `/opportunities/complete?id={opportunityId}` - Success page

All pages require authentication and are protected routes.