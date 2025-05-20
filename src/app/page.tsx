'use client';

import { useState } from 'react';
import { Button, HStack } from '@chakra-ui/react';

const Demo = () => {
  const [clicked, setClicked] = useState(false);

  return (
    <HStack>
      <Button onClick={() => setClicked(!clicked)}>
        {clicked ? 'You clicked me!' : 'Click me'}
      </Button>
      <Button colorScheme="blue" onClick={() => alert('Hello from Chakra!')}>
        Alert!
      </Button>
    </HStack>
  );
};

export default function HomePage() {
  return <Demo />;
}