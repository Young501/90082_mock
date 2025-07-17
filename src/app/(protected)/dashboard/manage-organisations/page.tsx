import { Box, Container, Text } from '@chakra-ui/react'
import React from 'react'

const ManageOrganisationsPage = () => {
  return (
    <Box py={6} px={{ base: 4, lg: "72px" }} maxW="1512px" mx="auto" mt="126px">
      <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
        <Text as="h1" fontSize={{base: "32px", lg: "51px"}} fontWeight="600" color="#000000">
          Manage Organisations
        </Text>
        <Box bg="white" borderRadius="20px" p={{base: 6, lg: 12}} boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)" width="100%">
          <Text fontSize={{base: "20px", lg: "30px"}} fontWeight="600" color="#000000">Organisations invited to opportunity:</Text>
        </Box>
      </Container>
    </Box>
  )
}

export default ManageOrganisationsPage