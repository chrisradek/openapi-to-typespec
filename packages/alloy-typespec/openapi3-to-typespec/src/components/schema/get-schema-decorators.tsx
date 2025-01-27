import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPISchema3_1, Refable } from "../../openapi-types.js";

export function getSchemaDecorators(
  schema: Refable<OpenAPISchema3_1>,
): ay.Children[] {
  const decorators: ay.Children[] = [];

  // TODO: For refs, sibling extensions can take precedence over actual schema's extensions
  if ("$ref" in schema) return decorators;

  if (schema.title) {
    decorators.push(
      <tsp.DecoratorExpression name="summary">
        <tsp.ValueExpression value={schema.title} />
      </tsp.DecoratorExpression>,
    );
  }

  if (schema.type) {
    // TODO: Going to need to figure out what to do when
    // we have a union type since decorators may only apply
    // to one of the types and otherwise throw an error
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    for (const t of types) {
      switch (t) {
        case "array":
          populateArraySchemaDecorators(decorators, schema);
          break;
        case "integer":
        case "number":
          populateNumberSchemaDecorators(decorators, schema);
          break;
        case "string":
          populateStringSchemaDecorators(decorators, schema);
          break;
        default:
          break;
      }
    }
  }

  // @discriminator?
  // @oneOf?

  return decorators;
}

function populateArraySchemaDecorators(
  decorators: ay.Children[],
  schema: OpenAPISchema3_1,
): void {
  if (typeof schema.minItems === "number") {
    decorators.push(
      <tsp.DecoratorExpression name="minItems">
        <tsp.ValueExpression value={schema.minItems} />
      </tsp.DecoratorExpression>,
    );
  }

  if (typeof schema.maxItems === "number") {
    decorators.push(
      <tsp.DecoratorExpression name="maxItems">
        <tsp.ValueExpression value={schema.maxItems} />
      </tsp.DecoratorExpression>,
    );
  }
}

function populateNumberSchemaDecorators(
  decorators: ay.Children[],
  schema: OpenAPISchema3_1,
): void {
  if (typeof schema.minimum === "number") {
    decorators.push(
      <tsp.DecoratorExpression name="minValue">
        <tsp.ValueExpression value={schema.minimum} />
      </tsp.DecoratorExpression>,
    );
  }
  if (typeof schema.maximum === "number") {
    decorators.push(
      <tsp.DecoratorExpression name="maxValue">
        <tsp.ValueExpression value={schema.maximum} />
      </tsp.DecoratorExpression>,
    );
  }
  if (typeof schema.exclusiveMinimum === "number") {
    decorators.push(
      <tsp.DecoratorExpression name="minValueExclusive">
        <tsp.ValueExpression value={schema.exclusiveMinimum} />
      </tsp.DecoratorExpression>,
    );
  }
  if (typeof schema.exclusiveMaximum === "number") {
    decorators.push(
      <tsp.DecoratorExpression name="maxValueExclusive">
        <tsp.ValueExpression value={schema.exclusiveMaximum} />
      </tsp.DecoratorExpression>,
    );
  }
}

function populateStringSchemaDecorators(
  decorators: ay.Children[],
  schema: OpenAPISchema3_1,
): void {
  if (typeof schema.minLength === "number") {
    decorators.push(
      <tsp.DecoratorExpression name="minLength">
        <tsp.ValueExpression value={schema.minLength} />
      </tsp.DecoratorExpression>,
    );
  }

  if (typeof schema.maxLength === "number") {
    decorators.push(
      <tsp.DecoratorExpression name="maxLength">
        <tsp.ValueExpression value={schema.maxLength} />
      </tsp.DecoratorExpression>,
    );
  }

  if (typeof schema.pattern === "string") {
    decorators.push(
      <tsp.DecoratorExpression name="pattern">
        <tsp.ValueExpression value={escapeRegex(schema.pattern)} />
      </tsp.DecoratorExpression>,
    );
  }

  if (
    typeof schema.format === "string" &&
    !knownStringFormats.has(schema.format)
  ) {
    decorators.push(
      <tsp.DecoratorExpression name="format">
        <tsp.ValueExpression value={schema.format} />
      </tsp.DecoratorExpression>,
    );
  }
}

function escapeRegex(str: string) {
  return str.replace(/\\/g, "\\\\");
}

const knownStringFormats = new Set([
  "date",
  "date-time",
  "time",
  "duration",
  "uri",
]);
