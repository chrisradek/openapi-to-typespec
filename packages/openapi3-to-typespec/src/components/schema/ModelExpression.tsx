import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPISchema3_1 } from "../../openapi-types.js";
import { SchemaExpression } from "./SchemaExpression.jsx";
import { getSchemaDecorators } from "./get-schema-decorators.jsx";
import { getExtensions } from "../../get-extensions.js";
import { openapiLib } from "../../packages/openapi.js";
import { SchemaDecorators } from "./SchemaDecorators.jsx";

export interface ModelExpressionProps {
  schema: OpenAPISchema3_1;
}

export function ModelExpression({ schema }: ModelExpressionProps) {
  // Lot's to do here...
  // Need to check:
  // - additionalProperties
  // - properties
  // - allOf

  const properties: ay.Children[] = [];

  if (schema.allOf) {
    // TODO: handle allOf
    // Need to check whether we need to handle scenario where allOf contains a subschema
    // that isn't an `object` type when the base schema is an object.
    // for (const ref of schema.allOf) {
    //   if ("$ref" in ref) {
    //     // This is potentially incorrect, but I don't know when you'd realistically run into
    //     // `allOf` referencing
    //     properties.push(<tsp.SpreadExpression type={<SchemaExpression schema={ref} />} />);
    //   } else {
    //     properties.push(<SchemaExpression schema={ref} />);
    //   }
    // }
  }

  if (schema.properties) {
    const required = new Set(schema.required ?? []);
    for (const [key, prop] of Object.entries(schema.properties)) {
      properties.push(
        <>
          <SchemaDecorators schema={prop}/><tsp.ModelProperty name={key} optional={!required.has(key)} type={<SchemaExpression schema={prop} />} />
        </>,
      );
    }
  }

  // Check additionalProperties last since we'll emit just a plain Record if there are no other properties.
  if (typeof schema.additionalProperties === "object") {
    const record =
      <tsp.RecordExpression indexer={<SchemaExpression schema={schema.additionalProperties} />} />;
    if (!properties.length) {
      // Only have additionalProperties, so treat this as a record
      return record;
    } else {
      properties.push(ay.code`${<tsp.SpreadExpression type={record} />};`);
    }
  }

  return <tsp.ModelExpression>
      {ay.join(properties, {joiner: '\n'})}
    </tsp.ModelExpression>;
}
