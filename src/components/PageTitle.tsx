import { useEffect } from 'react';
import { setPageTitle } from '@/utils/setPageTitle';

interface PageTitleProps {
  title: string;
}

export const PageTitle = ({ title }: PageTitleProps) => {
  useEffect(() => {
    setPageTitle(title);
  }, [title]);

  return null;
}; 