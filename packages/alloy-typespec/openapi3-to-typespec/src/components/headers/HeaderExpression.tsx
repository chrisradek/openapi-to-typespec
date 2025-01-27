import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPI3Header, Refable } from "../../openapi-types.js";
import { useOpenApi } from "../../context/openapi.js";
import { httpLib } from "../../packages/http.js";
import { LegacyModelExpression } from "../LegacyModelExpression.jsx";
import { camelCase, kebabCase } from "change-case";
import { SchemaDecorators } from "../schema/SchemaDecorators.jsx";
import { SchemaExpression } from "../schema/SchemaExpression.jsx";

export type HeaderExpressionProps = {
  name: string;
  header: Refable<OpenAPI3Header>;
};

export function HeaderExpression(props: HeaderExpressionProps) {
  const { resolveReference } = useOpenApi();
  const name = props.name;
  const propertyName = camelCase(name);
  const needsExplicitHeaderName = !areCompatibleNames(name, propertyName);
  // TODO: description/summary from $ref
  const header = "$ref" in props.header ?
    resolveReference<OpenAPI3Header>(props.header.$ref)!
  : props.header;

  const isRequired = header.required ?? false;
  const decorators: ay.Children[] = [];
  // TODO: @header params
  decorators.push(
    <tsp.DecoratorExpression refkey={httpLib.Http["@header"]}>
      {needsExplicitHeaderName && <LegacyModelExpression value={{name}} />}
    </tsp.DecoratorExpression>,
  );
  const decoratorOutput = ay.join(decorators, { joiner: "\n", ender: "\n" });
  return <>
    {decoratorOutput}<SchemaDecorators schema={header.schema} /><tsp.ModelProperty
      name={propertyName}
      optional={!isRequired}
      type={<SchemaExpression schema={header.schema} />}
    />
  </>;
}

function areCompatibleNames(header: string, property: string): boolean {
  // By default, the header name will be the property name converted to kebab-case
  return kebabCase(property) === header.toLowerCase();
}
