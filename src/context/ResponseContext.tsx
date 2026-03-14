import { createContext, useContext, useReducer, type ReactNode } from 'react';

// Simple counter to trigger re-renders when localStorage changes
interface ResponseState {
  version: number;
}

type ResponseAction = { type: 'INVALIDATE' };

function responseReducer(state: ResponseState, action: ResponseAction): ResponseState {
  switch (action.type) {
    case 'INVALIDATE':
      return { version: state.version + 1 };
    default:
      return state;
  }
}

const ResponseContext = createContext<{
  version: number;
  invalidate: () => void;
} | null>(null);

export function ResponseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(responseReducer, { version: 0 });

  return (
    <ResponseContext.Provider
      value={{ version: state.version, invalidate: () => dispatch({ type: 'INVALIDATE' }) }}
    >
      {children}
    </ResponseContext.Provider>
  );
}

export function useResponseContext() {
  const ctx = useContext(ResponseContext);
  if (!ctx) throw new Error('useResponseContext must be used within ResponseProvider');
  return ctx;
}
