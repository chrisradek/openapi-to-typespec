import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPISchema3_1 } from "../../openapi-types.js";
import { SchemaExpression } from "./SchemaExpression.jsx";
import { useOpenApi } from "../../context/openapi.js";
import { SchemaDecorators } from "./SchemaDecorators.jsx";

export interface ModelDeclarationProps extends tsp.ModelDeclarationProps {
  schema: OpenAPISchema3_1;
}

export function ModelDeclaration({
  schema,
  refkey,
  ...props
}: ModelDeclarationProps) {
  const { resolveReference } = useOpenApi();
  const declRefkey = refkey ?? ay.refkey(schema);
  const properties: ay.Children[] = [];
  let baseSchema: OpenAPISchema3_1 | undefined;
  function collectModelProperties(schema: OpenAPISchema3_1): void {
    if (schema.allOf) {
      let foundParentWithDiscriminator = false;
      for (const subSchema of schema.allOf) {
        // merge inlined-schemas with base schema
        if (!("$ref" in subSchema)) {
          collectModelProperties(subSchema);
          continue;
        }

        const ref = resolveReference<OpenAPISchema3_1>(subSchema.$ref);
        if (!ref) {
          console.warn(`Could not resolve reference ${subSchema.$ref}`);
          continue;
        }

        if (!ref.discriminator) {
          properties.push(<><tsp.SpreadExpression type={ay.refkey(ref)} />;</>);
          continue;
        }

        if (!foundParentWithDiscriminator) {
          baseSchema = ref;
          foundParentWithDiscriminator = true;
          continue;
        }

        // can only extend once
        if (baseSchema) {
          properties.push(
            <><tsp.SpreadExpression type={ay.refkey(baseSchema)} />;</>,
          );
          baseSchema = undefined;
        }

        properties.push(<><tsp.SpreadExpression type={ay.refkey(ref)} />;</>);
      }
    }

    if (schema.properties) {
      const required = new Set(schema.required ?? []);
      for (const [key, prop] of Object.entries(schema.properties)) {
        properties.push(
          <>
            <SchemaDecorators schema={prop} /><tsp.ModelProperty
                name={key}
                optional={!required.has(key)}
                type={<SchemaExpression schema={prop} />}
            />
        </>,
        );
      }
    }

    // `model Foo { ...Record<string> }` and `model Foo is Record<string>;` are treated the same by
    // the openapi3 emitter. The former is more flexible if actual properties are defined.
    if (typeof schema.additionalProperties === "object") {
      const record =
        <tsp.RecordExpression
          indexer={<SchemaExpression schema={schema.additionalProperties} />}
        />;
      properties.push(<><tsp.SpreadExpression type={record} />;</>);
    }
  }
  collectModelProperties(schema);

  // decorators
  const decorators: ay.Children[] = [];
  if (schema.discriminator) {
    decorators.push(
      <tsp.DecoratorExpression name="discriminator">
        <tsp.ValueExpression value={schema.discriminator.propertyName} />
      </tsp.DecoratorExpression>,
    );
  }

  const decoratorOutput = ay.join(decorators, { joiner: "\n", ender: "\n" });

  return <>
    {decoratorOutput}<tsp.ModelDeclaration {...props} baseModel={baseSchema && ay.refkey(baseSchema)} refkey={declRefkey}>
      {ay.join(properties, { joiner: "\n"})}
    </tsp.ModelDeclaration>
  </>;
}
