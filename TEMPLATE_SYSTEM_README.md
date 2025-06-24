# Simplified Onboarding Template System

This system provides a clean, guide-based approach to create custom layouts for onboarding pages, making it much simpler and more flexible than the previous complex field-pattern system.

## Overview

The template system automatically assigns appropriate layouts based on the `guide` value and `userType`, making the onboarding experience more visually appealing and user-friendly without the complexity of field pattern matching.

## How It Works

### 1. Guide-Based Template Assignment

The system assigns templates based on:

- **Guide text content** (e.g., "Tell us a bit about you" → Profile template)
- **User type** (student vs partner)
- **Simple string matching** in the guide field

### 2. Available Templates

#### Student Templates

- **StudentProfileTemplate**: "Tell us a bit about you"

  - Horizontal layout for name fields
  - Card-style sections with gray theme

- **StudentCourseTemplate**: "Tell us about your current degree"

  - Blue-themed card for academic information
  - Vertical layout for course selection

- **StudentSkillsTemplate**: "Tell us more about your skills and credentials"

  - Separate green cards for skills and credentials
  - Multi-select friendly layout

- **StudentDiscoveryTemplate**: "More information to help others discover you!"
  - Multiple colored sections (purple, orange, teal)
  - Grid layout for social links

#### Partner Templates

- **PartnerProfileTemplate**: "Tell us a bit about you."

  - Similar to student profile but for partner data
  - Handles alum follow-up questions

- **PartnerOrganizationTemplate**: "Tell us about your organization"

  - Blue-themed sections for company info
  - Grid layout for company details

- **PartnerDiscoveryTemplate**: "More information to help others discover you!"
  - Purple-themed grid for social links

#### Default Template

- **Fallback**: Used when no specific template matches
- **Layout**: Simple vertical stack

## Usage

### 1. Automatic Assignment (Works Out of the Box)

The system automatically assigns templates based on guide content:

```typescript
// In OnboardingSteps.tsx
const PageTemplate = getPageTemplate(currentPage.guide, userType);
```

### 2. Template Selection Logic

```typescript
export const getPageTemplate = (guide: string, userType?: string) => {
  const guideLower = guide.toLowerCase();

  if (userType === "student") {
    if (guideLower.includes("bit about you")) {
      return StudentProfileTemplate;
    }
    if (guideLower.includes("current degree")) {
      return StudentCourseTemplate;
    }
    // ... more conditions
  }

  if (userType === "partner") {
    if (guideLower.includes("bit about you")) {
      return PartnerProfileTemplate;
    }
    // ... more conditions
  }

  return DefaultTemplate;
};
```

## Reusable UI Components

### FieldGroup Component

A flexible component for different layout types:

```typescript
<FieldGroup
  questions={nameFields}
  register={register}
  control={control}
  errors={errors}
  layout="horizontal"        // vertical | horizontal | grid | card
  columns={2}               // for grid layout
  spacing={4}               // spacing between fields
  title="Personal Information"
  bgColor="gray.50"         // background color
  borderColor="gray.300"    // border color
/>
```

### Layout Options

- **`vertical`**: Fields stacked vertically (default)
- **`horizontal`**: Fields arranged side by side
- **`grid`**: Fields in a responsive grid
- **`card`**: Fields in a styled card container

## Adding New Templates

### 1. Create a New Template

```typescript
export const CustomTemplate = ({
  page,
  register,
  control,
  errors,
  clearErrors,
  unregister,
  userType,
}: PageTemplateProps) => {
  return (
    <VStack spacing={8} align="stretch">
      <FieldGroup
        questions={page.questions}
        register={register}
        control={control}
        errors={errors}
        clearErrors={clearErrors}
        unregister={unregister}
        layout="card"
        title="Custom Section"
        bgColor="yellow.50"
        borderColor="yellow.200"
      />
    </VStack>
  );
};
```

### 2. Add to Template Selection

```typescript
export const getPageTemplate = (guide: string, userType?: string) => {
  const guideLower = guide.toLowerCase();

  if (guideLower.includes("your custom guide text")) {
    return CustomTemplate;
  }

  // ... existing conditions
  return DefaultTemplate;
};
```

## Benefits of This Approach

1. **Simple & Clear**: Guide-based matching is intuitive and easy to understand
2. **Flexible**: Easy to add new templates for different user types
3. **Maintainable**: No complex field pattern matching logic
4. **Reusable**: FieldGroup component can be used across templates
5. **Scalable**: Easy to extend for new user types or page types

## Example Output

Based on your JSON data:

### Student Flow

- **Page 1**: "Tell us a bit about you" → StudentProfileTemplate
- **Page 2**: "Tell us about your current degree" → StudentCourseTemplate
- **Page 3**: "Tell us more about your skills and credentials" → StudentSkillsTemplate
- **Page 4**: "More information to help others discover you!" → StudentDiscoveryTemplate

### Partner Flow

- **Page 1**: "Tell us a bit about you." → PartnerProfileTemplate
- **Page 2**: "Tell us about your organization" → PartnerOrganizationTemplate
- **Page 3**: "More information to help others discover you!" → PartnerDiscoveryTemplate

## Files Structure

```
src/components/onboarding/
├── PageTemplates.tsx     # All template components
├── index.ts             # Exports
└── README.md           # Component documentation

src/app/(auth)/onboarding/
└── OnboardingSteps.tsx  # Uses guide-based templates

src/hooks/
└── useOnboardingLogic.ts # Simplified logic

src/types/
└── onboarding.ts        # Simplified types
```

This approach is much cleaner, more maintainable, and provides the UI flexibility you need without the complexity of the previous system!
