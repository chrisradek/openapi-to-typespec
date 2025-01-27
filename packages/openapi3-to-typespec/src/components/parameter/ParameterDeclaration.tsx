import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { useOpenApi } from "../../context/openapi.js";
import { OpenAPI3Parameter, Refable } from "../../openapi-types.js";
import { SchemaExpression } from "../schema/SchemaExpression.jsx";
import { httpLib } from "../../packages/http.js";
import { SchemaDecorators } from "../schema/SchemaDecorators.jsx";

export interface ParameterDeclarationProps extends tsp.ModelDeclarationProps {
  name: string;
  parameter: Refable<OpenAPI3Parameter>;
}

export function ParameterDeclaration({
  parameter,
  refkey,
  ...props
}: ParameterDeclarationProps) {
  // Parameter declarations will be models, where the parameter is a modelProperty.
  // Unfortunately this will mean we'll be spreading a lot of parameters in our operations
  // if they aren't in-lined.
  // I could add an option to in-line all parameters instead of using refs in the future.
  // (That would mean resolving the refs when collecting operations, and skipping Parameter Declaration generation)

  const { resolveReference } = useOpenApi();
  if ("$ref" in parameter) {
    parameter = resolveReference<OpenAPI3Parameter>(parameter.$ref)!;
  }
  const declRefkey = refkey ?? ay.refkey(parameter);
  const isRequired = parameter.required ?? false;

  const decorators: ay.Children[] = [];
  decorators.push(
    <tsp.DecoratorExpression refkey={httpLib.Http[`@${parameter.in}`]} />,
  );

  const decoratorOutput = ay.join(decorators, { joiner: "\n", ender: "\n" });
  // TODO: Need to make the ModelProperty referenceable? (Guess not really, we're spreading the model...)
  return <tsp.ModelDeclaration {...props} refkey={declRefkey}>
    {decoratorOutput}<SchemaDecorators schema={parameter.schema} /><tsp.ModelProperty name={parameter.name} optional={!isRequired} type={<SchemaExpression schema={parameter.schema} />} />
  </tsp.ModelDeclaration>;
}
