import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      isDark: false,
      setTheme: (theme) => {
        const isDark =
          theme === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : theme === 'dark';

        // Atualiza as cores do tema no manifest
        const metaThemeColor = document.querySelector(
          'meta[name="theme-color"]'
        );
        if (metaThemeColor) {
          metaThemeColor.setAttribute(
            'content',
            isDark ? '#000000' : '#ffffff'
          );
        }

        // Atualiza as classes do Tailwind
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        set({ theme, isDark });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
