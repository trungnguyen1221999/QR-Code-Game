import { createContext, useContext, useState } from 'react';

const RefetchContext = createContext();

export function RefetchProvider({ children }) {
  const [needRefetch, setNeedRefetch] = useState(false);

  return (
    <RefetchContext.Provider value={{ needRefetch, setNeedRefetch }}>
      {children}
    </RefetchContext.Provider>
  );
}

export function useRefetch() {
  const context = useContext(RefetchContext);
  if (!context) {
    throw new Error('useRefetch must be used within a RefetchProvider');
  }
  return context;
}
