"use client";

import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";
import { ReactNode } from "react";
import Loader from "@/components/ui/Loader";
import { useAuthStore } from "@/store/authStore";

interface CustomButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "ghost" | "student" | "partner";
  isLoading?: boolean;
  iconPosition?: "start" | "end";
  icon?: React.ReactNode;
  children: ReactNode;
}

export function ButtonV2({
  variant = "primary",
  isLoading,
  children,
  iconPosition = "start",
  icon,
  ...props
}: CustomButtonProps) {
  const userType = useAuthStore((state) => state.getUserType());
  const styles = {
    primary: {
      bg: "profile.500",
      color: "#FFFFFF",
      h: "32px",
      borderRadius: "xl",
      fontSize: "xs",
      fontWeight: "500",
      _hover: {
        bg: "profile.dark",
      },
      _active: {
        transform: "scale(0.98)",
      },
    },

    secondary: {
      bg: userType === "organisation" ? "#E9F7F6" : "#EAF6FD",
      color: userType === "organisation" ? "#3AADA8" : "#2AA8E0",
      h: "32px",
      borderRadius: "xl",
      fontSize: "xs",
      fontWeight: "500",
      border:
        "1px solid " + (userType === "organisation" ? "#D3EFEA" : "#D6EDFB"),
      _hover: {
        bg: "var(--border-100)",
        color: "profile.dark",
      },
      _active: {
        transform: "scale(0.98)",
      },
    },
    ghost: {
      bg: "transparent",
      color: "#2CA9DF",
      fontSize: "xs",
      fontWeight: "400",
      _active: {
        transform: "scale(0.98)",
      },
      _hover: {
        textDecoration: "underline",
      },
    },
    student: {
      bg: "#DC2626",
      color: "white",
      borderRadius: "xl",
      fontSize: "14px",
      fontWeight: "bold",
      _hover: {
        bg: "#DC2626/80",
      },
      _active: {
        transform: "scale(0.98)",
      },
      _disabled: {
        bg: "#DC2626/60",
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },
    partner: {
      bg: "#22C45E",
      color: "white",
      borderRadius: "xl",
      fontSize: "14px",
      fontWeight: "bold",
      _hover: {
        bg: "#22C45E/80",
      },
      _active: {
        transform: "scale(0.98)",
      },
      _disabled: {
        bg: "#22C45E/60",
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },
  };

  return (
    <ChakraButton {...styles[variant]} {...props}>
      {isLoading ? (
        <Loader size="sm" props={{ color: "white" }} />
      ) : (
        <>
          {iconPosition === "start" && icon}
          {children}
          {iconPosition === "end" && icon}
        </>
      )}
    </ChakraButton>
  );
}
