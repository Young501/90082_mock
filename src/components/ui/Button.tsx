"use client";

import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";
import { ReactNode } from "react";
import Loader from "@/components/ui/Loader";
import { PROFILE_COLORS, PROFILE_DARK_COLORS } from "@/theme/theme";

interface CustomButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "ghost" | "student" | "partner";
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  isLoading,
  children,
  ...props
}: CustomButtonProps) {
  const styles = {
    primary: {
      bg: "#002157",
      color: "#A2DDF0",
      h: "60px",
      borderRadius: "30px",
      fontSize: "20px",
      fontWeight: "400",
      _hover: {
        bg: "#001844",
      },
      _active: {
        transform: "scale(0.98)",
      },
      _disabled: {
        bg: "#4a5568",
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },
    secondary: {
      bg: "transparent",
      color: "#2CA9DF",
      border: "2px solid",
      borderColor: "#2CA9DF",
      h: "60px",
      borderRadius: "30px",
      fontSize: "20px",
      fontWeight: "400",
      _hover: {
        bg: "rgba(44, 169, 223, 0.1)",
      },
      _active: {
        transform: "scale(0.98)",
      },
    },
    ghost: {
      bg: "transparent",
      color: "#2CA9DF",
      fontSize: "16px",
      fontWeight: "400",
      _hover: {
        textDecoration: "underline",
      },
    },
    student: {
      bg: PROFILE_DARK_COLORS.student,
      color: "white",
      borderRadius: "xl",
      fontSize: "14px",
      fontWeight: "bold",
      _hover: {
        bg: PROFILE_COLORS.student,
      },
      _active: {
        transform: "scale(0.98)",
      },
      _disabled: {
        bg: PROFILE_DARK_COLORS.student,
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },
    partner: {
      bg: PROFILE_DARK_COLORS.organisation,
      color: "white",
      borderRadius: "xl",
      fontSize: "14px",
      fontWeight: "bold",
      _hover: {
        bg: PROFILE_COLORS.organisation,
      },
      _active: {
        transform: "scale(0.98)",
      },
      _disabled: {
        bg: PROFILE_DARK_COLORS.organisation,
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },
  };

  return (
    <ChakraButton {...styles[variant]} {...props}>
      {isLoading ? <Loader size="sm" props={{ color: "white" }} /> : children}
    </ChakraButton>
  );
}
