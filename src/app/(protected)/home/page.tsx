'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

const Home = () => {
  return (
    <ProtectedRoute>
      <div>This is Home Page</div>
    </ProtectedRoute>
  );
};

export default Home;