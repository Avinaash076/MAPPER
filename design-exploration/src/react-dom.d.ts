// The repository has React DOM at runtime but no @types/react-dom package.
// Declare only the API this isolated preview uses; do not add dependencies.
declare module 'react-dom/client' {
  import type { ReactNode } from 'react';
  export function createRoot(container: Element): { render(children: ReactNode): void };
}
declare module 'react-dom' {
  export function flushSync(callback: () => void): void;
}
