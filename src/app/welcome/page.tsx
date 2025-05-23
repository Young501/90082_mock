'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Link,
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
import { useRouter } from 'next/navigation';
import { useUserType } from '@contexts/UserTypeContext';
import ChakraProviders from '@components/ui/ChakraProviders';

type UserType = {
  key: string;
  name: string;
};

const userTypeIcons: Record<string, any> = {
  student: FaGraduationCap,
  partner: FaBriefcase,
  academic: FaChalkboardTeacher,
  alumni: FaUniversity,
  staff: FaUserTie,
};

const userTypeColors: Record<string, string> = {
  student: 'blue.300',
  partner: 'blue.500',
  academic: 'blue.600',
  alumni: 'blue.400',
  staff: 'blue.700',
};

export default function WelcomePage() {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUserType } = useUserType();
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/user-types/')
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
    <ChakraProviders>
      <Flex height="100vh" overflow="hidden">
        {/* Left Panel */}
        <Box
          bg="blue.500"
          color="white"
          w="35%"
          minW="300px"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          px={10}
        >
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            UNICONNECTED
          </Text>
          <Text fontSize="xl" fontWeight="bold" mb={2} textAlign="center">
            Discover your connections here
          </Text>
          <Text textAlign="center">
            Connect with opportunities tailored to your{' '}
            <b>studies, skills, and career goals</b>
          </Text>
        </Box>

        {/* Right Panel */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          w="65%"
          p={8}
        >
          <Heading mb={2}>Welcome</Heading>
          <Text mb={6}>Create your account to get started</Text>

          {loading ? (
            <Spinner size="xl" />
          ) : (
            <VStack spacing={4} w="full" maxW="300px">
              {userTypes.map(({ key, name }) => {
                const IconComponent = userTypeIcons[key] ?? FaUser;
                const color = userTypeColors[key] ?? 'gray.500';
                return (
                  <Button
                    key={key}
                    onClick={() => handleSelect(key)}
                    leftIcon={<Icon as={IconComponent} boxSize={5} />}
                    bg={color}
                    color="white"
                    _hover={{ opacity: 0.9 }}
                    w="full"
                    fontWeight="bold"
                  >
                    I&apos;m a {name}
                  </Button>
                );
              })}
            </VStack>
          )}

          <Text fontSize="sm" mt={6}>
            Already have an account?{' '}
            <Link href="/login" color="blue.500">
              Sign in
            </Link>
          </Text>
        </Flex>
      </Flex>
    </ChakraProviders>
  );
}
