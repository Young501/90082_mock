"use client"

import { Button as ChakraButton, ButtonProps, Spinner } from "@chakra-ui/react"
import { ReactNode } from "react"

interface CustomButtonProps extends Omit<ButtonProps, "variant"> {
    variant?: "primary" | "secondary" | "ghost"
    isLoading?: boolean
    children: ReactNode
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
    }

    return (
        <ChakraButton
            {...styles[variant]}
            {...props}
        >
            {isLoading ? <Spinner size="sm" /> : children}
        </ChakraButton>
    )
} 