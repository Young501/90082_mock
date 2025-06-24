# Onboarding Template System

This system provides a scalable way to create custom layouts for onboarding pages instead of just stacking fields vertically.

## Overview

The template system automatically assigns appropriate layouts based on the content of each page, making the onboarding experience more visually appealing and user-friendly.

## How It Works

### 1. Automatic Template Assignment

The system automatically assigns templates based on:

- Field patterns (e.g., `first_name`, `last_name` → "profile" template)
- Question types (e.g., multiple `multi-select` fields → "skills" template)
- Number of fields
- Required field combinations

### 2. Available Templates

#### Profile Template

- **When used**: Pages with personal information fields
- **Layout**: Card-based design with name fields in a grid
- **Fields**: `first_name`, `last_name`, `profile_picture`, `location`, `status`

#### Course Template

- **When used**: Pages with academic information
- **Layout**: Blue-themed card with vertical layout
- **Fields**: `course_name`, `course_stream`, `course_progression`

#### Skills Template

- **When used**: Pages with skills and credentials
- **Layout**: Separate cards for each skill category
- **Fields**: `skills`, `credentials`

#### Discovery Template

- **When used**: Pages with location preferences, documents, and social links
- **Layout**: Multiple colored sections
- **Fields**: `preferred_location`, `resume`, `homepage`, `linkedln`, etc.

#### Sectioned Template

- **When used**: Pages with 5+ fields
- **Layout**: Configurable sections with different layouts
- **Options**: `vertical`, `horizontal`, `grid`, `card`

#### Grid Template

- **When used**: Pages with 3-8 fields
- **Layout**: Responsive grid layout
- **Configurable**: Number of columns and gaps

#### Default Template

- **When used**: Fallback for simple pages
- **Layout**: Simple vertical stack

## Usage

### 1. Automatic Assignment (Recommended)

The system automatically assigns templates based on page content:

```typescript
// In useOnboardingLogic.ts
const pages: Page[] = useMemo(() => {
  const rawPages = pagesData?.onboarding_pages || [];
  return rawPages.map((page) => enhancePageWithTemplate(page));
}, [pagesData?.onboarding_pages]);
```

### 2. Manual Template Assignment

You can manually specify templates in your page data:

```typescript
{
  id: 1,
  guide: "Tell us about you",
  template: "profile", // Manual assignment
  layout: {
    sections: [
      {
        id: "personal-info",
        title: "Personal Information",
        fields: ["first_name", "last_name", "profile_picture"],
        layout: "card",
      },
    ],
  },
  questions: [...]
}
```

### 3. Custom Layout Configuration

You can specify custom layouts for any template:

```typescript
{
  id: 2,
  guide: "Academic Information",
  template: "sectioned",
  layout: {
    sections: [
      {
        id: "course-info",
        title: "Course Details",
        fields: ["course_name", "course_stream"],
        layout: "horizontal",
        spacing: 6,
      },
      {
        id: "progression-info",
        title: "Progression",
        fields: ["course_progression"],
        layout: "vertical",
      },
    ],
  },
  questions: [...]
}
```

## Layout Options

### Section Layouts

- **`vertical`**: Fields stacked vertically (default)
- **`horizontal`**: Fields arranged horizontally
- **`grid`**: Fields in a responsive grid
- **`card`**: Fields in a styled card container

### Grid Layout

```typescript
layout: {
  grid: {
    columns: 2, // Number of columns
    gap: 6,     // Gap between items
  },
  maxWidth: "1200px", // Optional max width
}
```

## Adding New Templates

1. Create a new template component in `PageTemplates.tsx`:

```typescript
export const CustomTemplate = ({
  page,
  register,
  control,
  errors,
  clearErrors,
  unregister,
}: PageTemplateProps) => {
  return (
    <VStack spacing={8} align="stretch">
      {/* Your custom layout */}
    </VStack>
  );
};
```

2. Add it to the `getPageTemplate` function:

```typescript
export const getPageTemplate = (templateName?: string) => {
  switch (templateName) {
    case "custom":
      return CustomTemplate;
    // ... other cases
    default:
      return DefaultTemplate;
  }
};
```

3. Add configuration in `templateConfig.ts`:

```typescript
export const templateConfigs: TemplateConfig[] = [
  {
    template: "custom",
    priority: 85,
    conditions: {
      fieldPatterns: ["your_field_pattern"],
      questionTypes: ["your_question_type"],
    },
  },
  // ... other configs
];
```

## Benefits

1. **Better UX**: Each page type has an appropriate layout
2. **Scalable**: Easy to add new templates and layouts
3. **Automatic**: No manual configuration needed
4. **Flexible**: Can override automatic assignment when needed
5. **Maintainable**: Clear separation of concerns

## Example Output

Based on your student data, the system will automatically create:

- **Page 1**: Profile template with card layout for personal info
- **Page 2**: Course template with blue-themed academic section
- **Page 3**: Skills template with separate cards for skills and credentials
- **Page 4**: Discovery template with multiple colored sections for location, documents, and social links

This creates a much more engaging and organized onboarding experience compared to the previous vertical stack layout.
