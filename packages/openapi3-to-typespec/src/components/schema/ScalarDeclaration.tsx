import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPISchema3_1 } from "../../openapi-types.js";
import { SchemaExpression } from "./SchemaExpression.jsx";
import { getSchemaDecorators } from "./get-schema-decorators.jsx";
import { getExtensions } from "../../get-extensions.js";
import { openapiLib } from "../../packages/openapi.js";

export interface ScalarDeclarationProps extends tsp.ScalarDeclarationProps {
  schema: OpenAPISchema3_1;
}

export function ScalarDeclaration({
  schema,
  refkey,
  ...props
}: ScalarDeclarationProps) {
  const declRefkey = refkey ?? ay.refkey(schema);

  const isUnknown = ay.computed(() => {
    return !schema.type && !("$ref" in schema);
  });

  const baseScalar = isUnknown.value ? undefined : (
    <SchemaExpression schema={schema} />
  );

  const schemaDecorators = ay.mapJoin(getSchemaDecorators(schema), (c) => c, {
    joiner: "\n",
    ender: "\n",
  });

  const extensions = ay.mapJoin(
    getExtensions(schema),
    (name, value) => {
      return <tsp.DecoratorExpression refkey={openapiLib.OpenAPI["@extension"]}>
        <tsp.ValueExpression value={name} />, <tsp.ValueExpression value={value} />
      </tsp.DecoratorExpression>;
    },
    {
      joiner: "\n",
      ender: "\n",
    },
  );

  return <>
  {schemaDecorators}{extensions}<tsp.ScalarDeclaration {...props} refkey={declRefkey} baseScalar={baseScalar} />
  </>;
}
