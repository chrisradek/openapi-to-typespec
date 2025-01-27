import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPISchema3_1, Refable } from "../../openapi-types.js";
import { useOpenApi } from "../../context/openapi.js";
import { ArrayExpression } from "./ArrayExpression.jsx";
import { ModelExpression } from "./ModelExpression.jsx";

export interface SchemaExpressionProps {
  schema: Refable<OpenAPISchema3_1>;
}
// TODO: Binary types!

export function SchemaExpression({ schema }: SchemaExpressionProps) {
  const { resolveReference } = useOpenApi();
  // absolutely can't tell what this is, set to unknown (maybe never?)
  if (!schema) {
    return <tsp.TypeExpression builtin="unknown" />;
  }
  if ("$ref" in schema) {
    return <tsp.Reference refkey={ay.refkey(resolveReference(schema.$ref))} />;
  }

  const schemaType = schema.type;

  if (typeof schema.const !== "undefined") {
    return <tsp.ValueExpression value={schema.const} />;
  }

  if (schema.enum) {
    // Enums can only be scalar values, so safe to use ValueExpression here.
    return ay.mapJoin(
      schema.enum,
      (value) => <tsp.ValueExpression value={value} />,
      { joiner: " | " },
    );
  }

  if (schema.anyOf || schema.oneOf) {
    // TODO: May need to handle `schema.type` as well...not sure how common this is in the wild.
    // Follow-up: I did find some docs (not actual APIs) that put assertions in the `oneOf`/`anyOf`
    // sub-schemas while having the `type` be shared in the parent.
    const union = schema.oneOf ?? schema.anyOf ?? [];
    return ay.mapJoin(
      union,
      (variant) => {
        if ("$ref" in variant) {
          return <tsp.Reference refkey={ay.refkey(resolveReference(variant.$ref))} />;
        }

        return <SchemaExpression schema={variant} />;
      },
      { joiner: " | " },
    );
  }

  if (schemaType) {
    const schemaTypes = Array.isArray(schemaType) ? schemaType : [schemaType];
    return ay.mapJoin(
      schemaTypes,
      (type) => {
        if (type === "boolean") {
          return <tsp.TypeExpression builtin="boolean" />;
        } else if (type === "integer") {
          return <tsp.TypeExpression builtin={getIntegerType(schema.format)} />;
        } else if (type === "number") {
          return <tsp.TypeExpression builtin={getNumberType(schema.format)} />;
        } else if (type === "null") {
          return <tsp.TypeExpression builtin="null" />;
        } else if (type === "string") {
          return <tsp.TypeExpression builtin={getStringType(schema.format)} />;
        } else if (type === "array") {
          return <ArrayExpression schema={schema} />;
        } else if (type === "object") {
          return <ModelExpression schema={schema} />;
        }
      },
      { joiner: " | " },
    );
  }

  // TODO: default assignment or let caller handle that?
}

function getIntegerType(format?: string): tsp.IntrinsicScalarName {
  switch (format) {
    case "int8":
    case "int16":
    case "int32":
    case "int64":
    case "uint8":
    case "uint16":
    case "uint32":
    case "uint64":
      return format;
    case "double-int":
      return "safeint";
    default:
      return "integer";
  }
}

function getNumberType(format?: string): tsp.IntrinsicScalarName {
  switch (format) {
    case "decimal":
    case "decimal128":
      return format;
    case "double":
      return "float64";
    case "float":
      return "float32";
    default:
      // Could be either 'float' or 'numeric' - add FIXME?
      return "numeric";
  }
}

function getStringType(format?: string): tsp.IntrinsicScalarName {
  switch (format) {
    case "binary":
    case "byte":
      return "bytes";
    case "date":
      return "plainDate";
    case "date-time":
      // Can be 'offsetDateTime' or 'utcDateTime' - needs FIXME or union?
      return "utcDateTime";
    case "time":
      return "plainTime";
    case "duration":
      return "duration";
    case "uri":
      return "url";
    default:
      return "string";
  }
}
