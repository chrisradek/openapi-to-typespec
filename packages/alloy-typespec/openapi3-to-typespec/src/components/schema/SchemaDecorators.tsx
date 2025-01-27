import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPISchema3_1, Refable } from "../../openapi-types.js";
import { getSchemaDecorators } from "./get-schema-decorators.jsx";
import { getExtensions } from "../../get-extensions.js";
import { openapiLib } from "../../packages/openapi.js";

export interface SchemaDecoratorsProps {
  schema: Refable<OpenAPISchema3_1>;
}

export function SchemaDecorators({ schema }: SchemaDecoratorsProps) {
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
  return ay.code`${schemaDecorators}${extensions}`;
}
