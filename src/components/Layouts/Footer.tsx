import { Box, Text, VStack } from "@chakra-ui/react"
import React from "react"
import Logo from "../Logo"

const Footer = () => {
    return (
        <Box
            bg="#002157"
            h="180px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={{ base: 4, lg: 8 }}
            color="white"
        >
            <VStack align="start" gap={2}>
                <Text fontSize="20px" fontWeight="700">
                    Need Help? Contact Us
                </Text>
                <Text fontSize="20px" fontWeight="700">
                    Copyright © UniConnected 2025.
                </Text>
            </VStack>

            <Logo variant="footer" width="300px" height="80px" />
        </Box>
    )
}

export default Footer
