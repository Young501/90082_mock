"use client";

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Container, VStack, Text, IconButton, HStack } from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { InvitationForm } from './component/InvitationForm';
import { PageTitle } from '@/components/PageTitle';
import { PAGE_TITLES } from '@/utils/pageTitles';

const InvitePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type');

  const handleSuccess = () => {
    router.push(`/dashboard/manage?type=${type}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/manage?type=${type}`);
  };

  if (type === 'student') {
    return <StudentInvitePage onSuccess={handleSuccess} onCancel={handleCancel} />
  } else if (type === 'partner') {
    return <PartnerInvitePage onSuccess={handleSuccess} onCancel={handleCancel} />
  }

  return (
    <Box py={6} px={{ base: 4, lg: "72px" }} maxW="1512px" mx="auto" mt={{base: "80px", lg: "126px"}}>
      <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
        <Text fontSize="lg" color="gray.500">
          Invalid invitation type
        </Text>
      </Container>
    </Box>
  )
}

export default InvitePage;

const StudentInvitePage = ({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) => {
  const router = useRouter();
  
  return (
    <>
      <PageTitle title={PAGE_TITLES.INVITE_STUDENTS} />
      <Box py={6} px={{ base: 0, lg: "72px" }} maxW="1512px" mx="auto" mt={{base: "80px", lg: "126px"}}>
        <Container maxW="1512px" display="flex" flexDirection="column" gap={8}>
          <VStack gap={6} align="stretch">
            <HStack gap={4} align="center">
              <IconButton
                aria-label="Go back"
                onClick={onCancel || (() => router.push('/dashboard/manage?type=student'))}
                variant="ghost"
                size="lg"
              >
                <ArrowLeft size={24} />
              </IconButton>
              <Text
                fontSize={{ base: "24px", lg: "32px" }}
                fontWeight="600"
                color="#000000"
              >
                Invite Students
              </Text>
            </HStack>
            
            <InvitationForm
              userType="student"
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </VStack>
        </Container>
      </Box>
    </>
  )
}

const PartnerInvitePage = ({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) => {
  const router = useRouter();
  
  return (
    <>
      <PageTitle title={PAGE_TITLES.INVITE_PARTNERS} />
      <Box py={6} px={{ base: 4, lg: "72px" }} maxW="1512px" mx="auto" mt={{base: "80px", lg: "126px"}}>
        <Container maxW="1512px" display="flex" flexDirection="column" gap={8}>
          <VStack gap={6} align="stretch">
            <HStack gap={4} align="center">
              <IconButton
                aria-label="Go back"
                onClick={onCancel || (() => router.push('/dashboard/manage?type=partner'))}
                variant="ghost"
                size="lg"
              >
                <ArrowLeft size={24} />
              </IconButton>
              <Text
                fontSize={{ base: "24px", lg: "32px" }}
                fontWeight="600"
                color="#000000"
              >
                Invite Organisations
              </Text>
            </HStack>
            
            <InvitationForm
              userType="partner"
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </VStack>
        </Container>
      </Box>
    </>
  )
}