import React from "react";
import { Box, VStack, HStack, Text, Card, Avatar } from "@chakra-ui/react";
import { PartnerProfile } from "@/types/discovery";

interface PartnerCardProps {
  partner: PartnerProfile;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const getDisplayName = () => {
    const firstName = partner.first_name || '';
    const lastName = partner.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'No name provided';
  };

  const getProfileImage = () => {
    return partner.profile_picture_url || null;
  };

  return (
    <Card.Root p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
      <Card.Body>
        <HStack align="start" gap={4}>

          <Box flexShrink={0}>
            <Avatar.Root size="md">
              <Avatar.Fallback name={getDisplayName()} />
              {getProfileImage() && (
                <Avatar.Image 
                  src={getProfileImage()!} 
                  onError={(e) => {
                    console.error('Failed to load image:', getProfileImage());
                    console.error('Error details:', e);
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', getProfileImage());
                  }}
                />
              )}
            </Avatar.Root>
          </Box>


          <VStack align="start" flex={1} gap={2}>
            <Text fontWeight="bold" fontSize="lg">
              {getDisplayName()}
            </Text>
            
            {partner.location && (
              <Text fontSize="sm" color="gray.600">
                📍 {partner.location}
              </Text>
            )}
            

            {Object.entries(partner).map(([key, value]) => {
              if (['id', 'first_name', 'last_name', 'location', 'profile_picture'].includes(key)) {
                return null;
              }
              
              if (value && typeof value === 'string' && value.trim()) {
                return (
                  <Text key={key} fontSize="sm">
                    <Text as="span" fontWeight="medium" textTransform="capitalize">
                      {key.replace(/_/g, ' ')}:
                    </Text>{' '}
                    {value}
                  </Text>
                );
              }

              if (Array.isArray(value) && value.length > 0) {
                return (
                  <Text key={key} fontSize="sm">
                    <Text as="span" fontWeight="medium" textTransform="capitalize">
                      {key.replace(/_/g, ' ')}:
                    </Text>{' '}
                    {value.join(', ')}
                  </Text>
                );
              }
              
              return null;
            })}
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}