'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Flex,
  Heading,
  Icon,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  FaGraduationCap,
  FaBriefcase,
  FaChalkboardTeacher,
  FaUserTie,
  FaUniversity,
  FaUser,
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext';

type UserType = {
  key: string;
  name: string;
};

const fallbackIcons: IconType[] = [
  FaGraduationCap,
  FaBriefcase,
  FaChalkboardTeacher,
  FaUserTie,
  FaUniversity,
  FaUser,
];

const fallbackColors: string[] = [
  'brand.700',
  'brand.800',
  'brand.900',
];

export default function WelcomePage() {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setUserType } = useAuth();

  useEffect(() => {
    fetch(API_ENDPOINTS.USER_TYPES)
      .then((res) => res.json())
      .then((data) => setUserTypes(data))
      .catch((err) => console.error('Error fetching:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (type: string) => {
    setUserType(type);
    router.push('/login');
  };

  return (
    <Flex direction="column" align="center" p={8}>
      <Heading mb={2}>Welcome</Heading>
      <Text mb={6}>Get started</Text>

      {loading ? (
        <Spinner size="xl" />
      ) : (
        <VStack gap={4} w="full" maxW="300px">
          {userTypes.map(({ key, name }, index) => {
            const IconComponent = fallbackIcons[index % fallbackIcons.length];
            const color = fallbackColors[index % fallbackColors.length];
            return (
              <Button
                key={key}
                onClick={() => handleSelect(key)}
                bg={color}
                color="white"
                _hover={{ opacity: 0.7 }}
                w="full"
                fontWeight="bold"
              >
                <Icon as={IconComponent} boxSize={5} />
                  I&apos;m a {name}
              </Button>
            );
          })}
        </VStack>
      )}
    </Flex>
  );
}