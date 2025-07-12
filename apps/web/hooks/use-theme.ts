'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      theme: undefined,
      setTheme,
      resolvedTheme: undefined,
      themes: ['light', 'dark', 'system'],
    };
  }

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  return {
    theme,
    setTheme,
    resolvedTheme,
    themes: ['light', 'dark', 'system'],
  };
}