import { createContext, useContext } from "@alloy-js/core";

export interface NamespaceContext {
  name: string;
}

export const NameSpaceContext = createContext<NamespaceContext>();

export function useNamespace() {
  return useContext(NameSpaceContext);
}
