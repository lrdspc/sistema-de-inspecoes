import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="theme-select" className="sr-only">
        Selecionar tema
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) =>
          setTheme(e.target.value as 'light' | 'dark' | 'system')
        }
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Selecionar tema da aplicação"
      >
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
        <option value="system">Sistema</option>
      </select>
    </div>
  );
}
