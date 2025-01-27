import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPISchema3_1 } from "../../openapi-types.js";
import { SchemaExpression } from "./SchemaExpression.jsx";

export interface ArrayExpressionProps
  extends Omit<tsp.ArrayExpressionProps, "indexer"> {
  schema: OpenAPISchema3_1;
}

export function ArrayExpression({ schema, ...props }: ArrayExpressionProps) {
  // TODO: should probably separate this into its own component
  if (schema.prefixItems && !schema.items) {
    const tupleItems = schema.prefixItems.map((
      p,
    ) => <SchemaExpression schema={p} />);
    return <tsp.TupleExpression items={tupleItems} />;
  }

  return <tsp.ArrayExpression {...props} indexer={<SchemaExpression schema={schema.items!} />} />;
}
