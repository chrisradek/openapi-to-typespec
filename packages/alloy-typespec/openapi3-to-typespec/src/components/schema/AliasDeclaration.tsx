import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPISchema3_1, Refable } from "../../openapi-types.js";
import { useOpenApi } from "../../context/openapi.js";

export interface AliasDeclarationProps
  extends Omit<tsp.AliasDeclarationProps, "type"> {
  schema: Refable<OpenAPISchema3_1>;
}

export function AliasDeclaration({
  schema,
  refkey,
  ...props
}: AliasDeclarationProps) {
  const { resolveReference } = useOpenApi();
  const declRefkey = refkey ?? ay.refkey(schema);
  // TODO: Apply decorators (e.g. docs)

  let type: ay.Children;
  if ("$ref" in schema) {
    type = <tsp.Reference refkey={ay.refkey(resolveReference(schema.$ref))} />;
  } else if (schema.type === "null") {
    type = <tsp.TypeExpression builtin="null" />;
  }

  return <tsp.AliasDeclaration {...props} refkey={declRefkey} type={type} />;
}
