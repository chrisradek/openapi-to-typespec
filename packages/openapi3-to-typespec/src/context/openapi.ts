import { createContext, useContext } from "@alloy-js/core";
import { OpenAPIDocument3_1 } from "../openapi-types.js";
import type OpenAPIParser from "@readme/openapi-parser";

export interface OpenApiContext {
  document: OpenAPIDocument3_1;
  resolveReference<T>(ref: string): T | undefined;
}

export const OpenApiContext = createContext<OpenApiContext>();

export function useOpenApi(): OpenApiContext {
  return useContext(OpenApiContext)!;
}

export function createOpenApiContext(parser: OpenAPIParser): OpenApiContext {
  const document = parser.api as OpenAPIDocument3_1;
  return {
    document,
    resolveReference<T>(ref: string): T | undefined {
      try {
        return parser.$refs.get(ref);
      } catch {
        console.error(`Could not resolve reference: ${ref}`);
        return;
      }
    },
  };
}
