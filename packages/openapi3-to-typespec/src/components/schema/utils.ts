import { JsonSchemaType, OpenAPISchema3_1, Refable } from "../../openapi-types.js";

export type TspDeclarationKinds = "alias" | "array" | "enum" | "model" | "scalar" | "union";

const allowedEnumTypes = new Set(["string", "number", "integer"] as const)

export function getTspKind(schema: Refable<OpenAPISchema3_1>): TspDeclarationKinds {
  // TODO: Should probably also include single type with `const` as an alias (literal)
  if ("$ref" in schema || schema.type === "null") {
    return "alias";
  }

  // Enums that have a type of string and/or number
  if (schema.enum && schema.type && schemaIncludesOnlyTypes(schema.type, allowedEnumTypes)) {
    return "enum";
  }

  if (schema.enum || schema.anyOf || schema.oneOf || Array.isArray(schema.type)) {
    return "union";
  }

  if (schema.type === "array") {
    return "array";
  }

  if (schema.allOf || schema.type === "object") {
    return "model";
  }

  return "scalar";
}

/**
 * Validates that the schema includes only the types provided.
 */
function schemaIncludesOnlyTypes(schemaTypes: NonNullable<OpenAPISchema3_1["type"]>, allowedTypes: Set<JsonSchemaType>): boolean {
  schemaTypes = Array.isArray(schemaTypes) ? schemaTypes : [schemaTypes];
  if (schemaTypes.length > allowedTypes.size) {
    return false;
  }

  for (const type of schemaTypes) {
    if (!allowedTypes.has(type)) {
      return false;
    }
  }

  return true;
}