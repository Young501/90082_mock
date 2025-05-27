'use client';

import { createContext } from 'react';

export const UserTypeContext = createContext<{
  userType: string;
  setUserType: (type: string) => void;
}>({
  userType: '',
  setUserType: () => {},
});