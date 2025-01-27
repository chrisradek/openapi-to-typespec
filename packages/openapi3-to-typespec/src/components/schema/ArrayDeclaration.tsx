import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPISchema3_1 } from "../../openapi-types.js";
import { ArrayExpression } from "./ArrayExpression.jsx";

export interface ArrayDeclarationProps extends tsp.ModelDeclarationProps {
  schema: OpenAPISchema3_1;
}

export function ArrayDeclaration({
  schema,
  refkey,
  ...props
}: ArrayDeclarationProps) {
  const declRefkey = refkey ?? ay.refkey(schema);

  // Declaring arrays as `model Foo is Array<x>` instead of `alias Foo = Array<x>`
  // so that we can support decorating the array.

  // TODO: Decorators
  return <tsp.ModelDeclaration
    {...props}
    refkey={declRefkey}
    sourceModel={<ArrayExpression wrapStyle schema={schema} />}
  />;
}
