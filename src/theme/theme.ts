import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react";

export const PROFILE_COLORS = {
  organisation: "#3AADA8",
  student: "#2AA8E0",
  coordinator: "#1F97D1",
} as const;

export const PROFILE_BORDER_COLORS = {
  organisation: "#D3EFEA",
  student: "#D6EDFB",
  coordinator: "#D6EDFB",
} as const;

// export const STUDENT_COLORS = {
//   primary: "#2AA8E0",
// } as const;

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          900: { value: "#1a365d" },
          800: { value: "#153e75" },
          700: { value: "#2a69ac" },
        },
        student: {
          primary: {
            500: { value: "#2AA8E0" },
          },
        },
        organisation: {
          primary: {
            500: { value: "#3AADA8" },
          },
        },
        coordinator: {
          primary: {
            500: { value: "#1F97D1" },
          },
        },
        profile: {
          500: { value: "var(--profile-500, #2AA8E0)" },
          
        },

        border: {
          100: { value: "var(--border-100, #D6EDFB)" },
        },
        // student: {
        //   primary: {
        //     500: { value: `${STUDENT_COLORS.primary}` },
        //   },
        // },
      },
      fonts: {
        body: { value: "'Manrope', sans-serif" },
        heading: { value: "'Manrope', sans-serif" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
