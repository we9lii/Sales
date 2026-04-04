/**
 * BACKWARDS COMPATIBILITY PROXY
 * This file forwards useRole to useAuth so we don't need to refactor 
 * all 10 pages immediately.
 */
import React from 'react';
export { useRole } from './AuthContext';

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // Now handled at the root level by AuthProvider
  return <>{children}</>;
}
