
import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          900: { value: '#1a365d' },
          800: { value: '#153e75' },
          700: { value: '#2a69ac' },
        },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export default system;
