import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { useOpenApi } from "../../context/openapi.js";
import { OpenAPI3Parameter, Refable } from "../../openapi-types.js";
import { httpLib } from "../../packages/http.js";
import { SchemaDecorators } from "../schema/SchemaDecorators.jsx";
import { SchemaExpression } from "../schema/SchemaExpression.jsx";

export interface ParameterExpressionProps {
  parameter: Refable<OpenAPI3Parameter>;
}

export function ParameterExpression({ parameter }: ParameterExpressionProps) {
  const { resolveReference } = useOpenApi();

  if ("$ref" in parameter) {
    return <><tsp.SpreadExpression type={<tsp.Reference refkey={ay.refkey(resolveReference(parameter.$ref))} />} />;</>;
  }

  const isRequired = parameter.required ?? false;

  const decorators: ay.Children[] = [];
  // TODO: refactor out Parameter decorators
  decorators.push(
    <tsp.DecoratorExpression refkey={httpLib.Http[`@${parameter.in}`]} />,
  );
  const decoratorOutput = ay.join(decorators, { joiner: "\n", ender: "\n" });

  return <>
    {decoratorOutput}<SchemaDecorators schema={parameter.schema} /><tsp.ModelProperty
      name={parameter.name}
      optional={!isRequired}
      type={<SchemaExpression schema={parameter.schema} />}
    />
  </>;
}
