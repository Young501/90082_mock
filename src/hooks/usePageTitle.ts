import { useEffect } from 'react';
import { setPageTitle } from '@/utils/setPageTitle';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    setPageTitle(title);
  }, [title]);
}; 