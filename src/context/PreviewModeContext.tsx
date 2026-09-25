/**
 * Preview Mode Context
 * 
 * Provides global access to the Client Preview Mode (Easter Egg) state,
 * allowing any form, input, or navigation component to conditionally render
 * read-only client-facing views.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useSecretClick } from '../hooks/useSecretClick';

interface PreviewModeContextType {
  isPreviewMode: boolean;
  setIsPreviewMode: (val: boolean) => void;
  handleSecretClick: () => void;
  exitPreviewMode: () => void;
  clickCount: number;
  requiredClicks: number;
}

const PreviewModeContext = createContext<PreviewModeContextType | undefined>(undefined);

export const PreviewModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const secretClick = useSecretClick({
    requiredClicks: 5,
    timeWindowMs: 2000,
  });

  return (
    <PreviewModeContext.Provider value={secretClick}>
      {children}
    </PreviewModeContext.Provider>
  );
};

export const usePreviewMode = (): PreviewModeContextType => {
  const context = useContext(PreviewModeContext);
  if (!context) {
    throw new Error('usePreviewMode must be used within a PreviewModeProvider');
  }
  return context;
};
