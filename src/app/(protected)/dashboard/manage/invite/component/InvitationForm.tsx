"use client";

import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Textarea,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { Plus, X, Mail, Users, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/tooltip';
import { useInviteParticipants } from '@/services/shared';
import { useAuthStore } from '@/store/authStore';

interface InvitationFormProps {
  userType: 'student' | 'partner';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const InvitationForm: React.FC<InvitationFormProps> = ({
  userType,
  onSuccess,
  onCancel,
}) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getCoordinatorOpportunities } = useAuthStore();
  const coordinatorOpportunities = getCoordinatorOpportunities();
  const opportunityId = coordinatorOpportunities[0] || '';

  const inviteParticipants = useInviteParticipants();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const processEmailInput = () => {
    if (!emailInput.trim()) return;

    const emailList = emailInput
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    let addedCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;

    emailList.forEach(email => {
      if (validateEmail(email)) {
        if (!emails.includes(email)) {
          setEmails(prev => [...prev, email]);
          addedCount++;
        } else {
          duplicateCount++;
        }
      } else {
        invalidCount++;
      }
    });

    setEmailInput('');

    if (addedCount > 0) {
      toast.success(`${addedCount} email${addedCount > 1 ? 's' : ''} added successfully`);
    }
    if (invalidCount > 0) {
      toast.warning(`${invalidCount} invalid email${invalidCount > 1 ? 's' : ''} ignored`);
    }
    if (duplicateCount > 0) {
      toast.info(`${duplicateCount} duplicate email${duplicateCount > 1 ? 's' : ''} skipped`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processEmailInput();
    }
  };

  const handleSubmit = async () => {
    if (emails.length === 0) {
      toast.error('Please add at least one email address');
      return;
    }

    if (!opportunityId) {
      toast.error('No opportunity found. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const invitations = emails.map(email => ({
        email: email.trim(),
        role: userType,
      }));

      const response = await inviteParticipants.mutateAsync({
        opportunityId,
        invitations,
      });

      const invitationsSent = response.invitations_sent || 0;
      const failedInvitations = response.failed_invitations.length || [];
      // const failedInvitationsList = response.failed_invitations || [];

      if (invitationsSent > 0 && failedInvitations.length === 0) {
        toast.success(`Invitations sent successfully to ${invitationsSent} ${userType === 'student' ? 'student(s)' : 'organisation(s)'}`);
      } else if (invitationsSent > 0 && failedInvitations > 0) {
        toast.success(`${invitationsSent} invitation${invitationsSent > 1 ? 's' : ''} sent successfully, ${failedInvitations} failed`);

        const failedInvitationsList = response.failed_invitations.map((invitation: string) => {
          const [email, reason] = invitation.split(': ');
          return `${email}: ${reason}`;
        });

        toast.error(`Failed invitations:\n${failedInvitationsList.join('\n')}`);
        console.log(failedInvitationsList);
      } else if (invitationsSent === 0 && failedInvitations > 0) {
        toast.error(`All invitations failed. ${failedInvitations} ${userType === 'student' ? 'student(s)' : 'organisation(s)'}, Already Invited`);
        
        const failedInvitationsList = response.failed_invitations.map((invitation: string) => {
          const [email, reason] = invitation.split(': ');
          return `${email}: ${reason}`;
        });
        toast.error(`Failed invitations:\n${failedInvitationsList.join('\n')}`);
        console.log(failedInvitationsList);

      } else {
        toast.success(response.detail || `Invitations sent successfully to ${emails.length} ${userType === 'student' ? 'student(s)' : 'organisation(s)'}`);
      }

      setEmails([]);
      setEmailInput('');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.detail || 'Failed to send invitations. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearAll = () => {
    setEmails([]);
    setEmailInput('');
  };

  return (
    <Box
      bg="white"
      borderRadius="24px"
      p={{ base: 6, lg: 8 }}
      boxShadow="0px 8px 32px rgba(0, 0, 0, 0.12)"
      minW="800px"
      maxW={{ base: "100%", lg: "800px" }}
      mx="auto"
      border="1px solid"
      borderColor="gray.200"
    >
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <HStack justify="center" mb={3}>
            <Users size={24} color="#2CA9DF" />
            <Text
              fontSize={{ base: "28px", lg: "36px" }}
              fontWeight="700"
              color="#1A202C"
            >
              Invite {userType === 'student' ? 'Students' : 'Organisations'}
            </Text>
          </HStack>
          <Text
            fontSize="16px"
            color="#718096"
            maxW="500px"
            mx="auto"
          >
            Add email addresses to send invitations. You can enter one email or paste multiple emails separated by commas, semicolons, or new lines.
          </Text>
        </Box>

        <Box>
          <HStack mb={4} gap={2}>
            <Text fontSize="18px" fontWeight="600" color="#1A202C">
              Enter Email (s)
            </Text>
          </HStack>

          <Box
            border="2px solid"
            borderColor="gray.200"
            borderRadius="16px"
            p={4}
            bg="gray.50"
          >
            <VStack gap={3} align="stretch">
              <Textarea
                ref={textareaRef}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email addresses (one per line, or separated by commas/semicolons)..."
                resize="vertical"
                rows={4}
                borderRadius="12px"
                border="2px solid"
                borderColor="#E2E8F0"
                _focus={{
                  borderColor: "#2CA9DF",
                  boxShadow: "0 0 0 1px #2CA9DF",
                }}
                fontSize="16px"
                bg="white"
              />
              <HStack justify="flex-end">
               
                <Button
                  onClick={processEmailInput}
                  disabled={!emailInput.trim()}
                  size="sm"
                  color="white"
                  variant="primary"
                  borderRadius="8px"
                  h="50px"
                  fontSize="18px"
                >
                  <HStack gap={2}>
                    <Plus size={18} />
                    <span>Add Emails</span>
                  </HStack>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>

        {emails.length > 0 && (
          <Box>
            <HStack justify="space-between" mb={4}>
              <HStack gap={2}>
                <Mail size={20} color="#2CA9DF" />
                <Text fontSize="18px" fontWeight="600" color="#1A202C">
                  Email Addresses ({emails.length})
                </Text>
              </HStack>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                color="red.500"
                _hover={{ bg: 'red.50' }}
              >
                Clear All
              </Button>
            </HStack>

            <Box
              border="1px solid"
              borderColor="gray.200"
              borderRadius="16px"
              p={4}
              bg="gray.50"
              maxH="300px"
              overflowY="auto"
            >
              <Flex wrap="wrap" gap={2} justify="start">
                {emails.map((email, index) => (
                  <Badge
                    key={index}
                    px={3}
                    py={2}
                    borderRadius="full"
                    bg="#2CA9DF"
                    color="white"
                    fontSize="14px"
                    fontWeight="500"
                    display="flex"
                    alignItems="center"
                    maxW="300px"
                    gap={2}
                  >
                    <Tooltip content={email}>
                      <Text
                        maxW="250px"
                        style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}
                      >
                        {email}
                      </Text>
                    </Tooltip>
                    <IconButton
                      aria-label="Remove email"
                      onClick={() => removeEmail(email)}
                      variant="ghost"
                      size="xs"
                      color="white"
                      _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                    >
                      <X size={14} />
                    </IconButton>
                  </Badge>
                ))}
              </Flex>
            </Box>
          </Box>
        )}

        <Box borderTop="1px solid" borderColor="gray.200" pt={6}>
          <HStack gap={4} justify="center">
            <Button
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Sending Invitations"
              disabled={emails.length === 0}
              color="white" 
              variant="primary"
              borderRadius="8px"
              h="60px"
            >
              <HStack gap={2}>
                <Send size={20} />
                <span>Send Invitations ({emails.length})</span>
              </HStack>
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}; 