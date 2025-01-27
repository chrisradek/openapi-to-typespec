import { OpenAPI3Operation } from "../../openapi-types.js";

export function isSharedOperation(operation: OpenAPI3Operation) {
  // An operation should be shared if it has multiple request body contents.
  // If we use a union for the body/content types, the generated OpenAPI will be misleading
  // as each content type will allow _any_ of the body types in the union.
  return Object.keys(operation.requestBody?.content ?? {}).length > 1;
}