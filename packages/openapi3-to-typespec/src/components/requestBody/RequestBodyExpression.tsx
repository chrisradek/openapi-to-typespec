import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPI3RequestBody } from "../../openapi-types.js";

export interface RequestBodyProps {
  requestBody: OpenAPI3RequestBody;
}

export function RequestBodyExpression({ requestBody }: RequestBodyProps) {

  const decorators: ay.Children[] = [];
  const decoratorOutput = ay.join(decorators, { joiner: "\n", ender: "\n" });

  const isRequired = requestBody.required ?? false;

  // `requestBody.content` is a Map<mediaTypeRange, MediaTypeObject>.
  // Example: { "application/json": { schema: { type: "object" } } }

  return <></>
}

// If I have more than 1 content type, I should render a sharedRoute with multiple operations

// For response content - it seems to work a bit better with unions as long as the request is the same