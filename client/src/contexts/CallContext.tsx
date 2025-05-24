
import React, { createContext, useContext, ReactNode } from 'react';

interface CallContextType {
  activeCall: any;
  initiateCall: (model: any) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initiateCall = (model: any) => {
    // In a real app, this would start a call with the model
    console.log('Initiating call with model:', model);
    // For now, just show an alert
    alert(`Starting call with ${model.firstName || model.username}`);
  };

  const value = {
    activeCall: null,
    initiateCall,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
