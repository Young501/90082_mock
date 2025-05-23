'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type UserTypeContextType = {
  userType: string;
  setUserType: (type: string) => void;
};

const UserTypeContext = createContext<UserTypeContextType>({
  userType: '',
  setUserType: () => {},
});

export const useUserType = () => useContext(UserTypeContext);

export const UserTypeProvider = ({ children }: { children: ReactNode }) => {
  const [userType, setUserType] = useState('');

  return (
    <UserTypeContext.Provider value={{ userType, setUserType }}>
      {children}
    </UserTypeContext.Provider>
  );
};
