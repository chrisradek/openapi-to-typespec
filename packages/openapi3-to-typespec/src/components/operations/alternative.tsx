import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { printIdentifier } from "@typespec/compiler";
import {
  OpenAPI3Operation,
  OpenAPI3Parameter,
  OpenAPI3PathItem,
  OpenAPI3RequestBody,
  Refable,
} from "../../openapi-types.js";
import { OpenApiContext, useOpenApi } from "../../context/openapi.js";
import { ParameterExpression } from "../parameter/ParameterExpression.jsx";
import { httpLib } from "../../packages/http.js";
import { isSharedOperation } from "./utilts.js";
import { SchemaExpression } from "../schema/SchemaExpression.jsx";
import { ResponseExpression } from "../responses/ResponseExpression.jsx";

const supportedHttpMethods = [
  "get",
  "put",
  "post",
  "delete",
  "head",
  "patch",
] as const;
type ReadonlyArrayIndexer<T> = T extends ReadonlyArray<infer U> ? U : T;
type SupportedHttpMethods = ReadonlyArrayIndexer<typeof supportedHttpMethods>;

export interface PathItemContext {
  path: string;
  extensions: Record<`x-${string}`, unknown>;
  parameters: Refable<OpenAPI3Parameter>[];
}

export interface PathItemProps {
  path: string;
  pathItem: Refable<OpenAPI3PathItem>;

  children?: ay.Children;
}

export function PathItem({ path, pathItem, ...props }: PathItemProps) {
  const { resolveReference } = useOpenApi();
  if ("$ref" in pathItem) {
    // TODO: resolve pathItem from `#/components/pathItems` and ignore the rest.
    // The behavior is undefined if both `$ref` and sibling fields are present,
    // so probably should log a warning and pick a strategy.
    // The spec implies that in future revisions `$ref` should be chosen, and sibling fields ignored.
    pathItem = resolveReference<OpenAPI3PathItem>(pathItem.$ref)!;
  }

  // Collection parameters/extensions/servers
  const parameters = pathItem.parameters ?? [];
  const keys = Object.keys(pathItem);
  const extensions = ay.computed(() => {
    return keys
      .filter((k) => k.startsWith("x-"))
      .reduce(
        (prev, key) => {
          const x = key as `x-${string}`;
          prev[x] = pathItem[x];
          return prev;
        },
        {} as Record<`x-${string}`, any>,
      );
  });

  const pathMethods = keys.filter((k) =>
    supportedHttpMethods.includes(k as any)) as SupportedHttpMethods[];

  return ay.mapJoin(
    pathMethods,
    (method) => {
      const httpOperation = pathItem[method]!;
      return <Operation common={{extensions: extensions.value, parameters, path}} httpMethod={method} operation={httpOperation} />;
    },
    { joiner: "\n\n" },
  );
}

export interface OperationProps {
  common: {
    path: string;
    extensions: Record<`x-${string}`, unknown>;
    parameters: Refable<OpenAPI3Parameter>[];
  };
  httpMethod: SupportedHttpMethods;
  operation: OpenAPI3Operation;
}

export function Operation({ common, httpMethod, operation }: OperationProps) {
  const { resolveReference } = useOpenApi();

  // Get final list of parameters, overriding common parameters that share location/name.
  const openApiParameters = ay.computed(() => {
    const parameters = [...common.parameters];
    for (const p of operation.parameters) {
      upsertMatchingParameter(resolveReference, parameters, p);
    }
    return parameters;
  });

  const decorators: ay.Children[] = [];
  decorators.push(
    <tsp.DecoratorExpression refkey={httpLib.Http[`@${httpMethod}`]} />,
  );
  decorators.push(
    <tsp.DecoratorExpression refkey={httpLib.Http["@route"]}>
    <tsp.ValueExpression value={common.path} />
  </tsp.DecoratorExpression>,
  );

  const operationName = printIdentifier(operation.operationId ?? "PLACEHOLDER");
  const operationRequestBody = operation.requestBody;
  const responses =
    operation.responses &&
    ay.mapJoin(
      Object.entries(operation.responses ?? {}),
      ([statusCode, response]) => {
        return <ResponseExpression statusCode={statusCode} response={response as any} />;
      },
      { joiner: " | " },
    );

  if (!operationRequestBody) {
    let operationParameters: ay.Children | undefined;
    if (openApiParameters.value.length) {
      operationParameters =
        <>
      
      <ay.Indent>
        {ay.mapJoin(openApiParameters.value, (parameter) => <ParameterExpression parameter={parameter} />)}
      </ay.Indent>
  
      </>;
    }
    // Great, we have all we need.
    return <OperationInstance
      decorators={decorators}
      name={operationName}
      operationParameters={operationParameters}
      returnType={responses}
    />;
  }

  const isShared = isSharedOperation(operation);
  return ay.mapJoin(Object.entries(operationRequestBody.content ?? {}), ([
    mediaTypeRange,
    mediaType,
  ]) => {
    // TODO: figure out better operation naming policy
    // Ideally we'd just set `@OpenAPI.operationId("")` and not worry _too_ much
    const subOperationName = isShared ?
      `${operation.operationId ?? "PLACEHOLDER"}_${mediaTypeRange.replace("/", "_")}`
    : operationName;
    const parameters = getRequestBodyAndContentTypeParams(
      operationRequestBody,
      mediaTypeRange,
    );

    const operationParameters =
      <>
      
      <ay.Indent>
        {ay.mapJoin(openApiParameters.value, (parameter) => <ParameterExpression parameter={parameter} />)}{parameters}
      </ay.Indent>

      </>;

    return <OperationInstance
        decorators={decorators}
        name={subOperationName}
        sharedRoute={isShared}
        operationParameters={operationParameters}
        returnType={responses}
      />;
  });
}

interface OperationInstanceProps {
  name: string;
  decorators: ay.Children[];
  sharedRoute?: boolean;
  operationParameters?: ay.Children;
  returnType?: ay.Children;
}

function OperationInstance(props: OperationInstanceProps) {
  const decorators = [...props.decorators];
  if (props.sharedRoute) {
    decorators.push(
      <tsp.DecoratorExpression refkey={httpLib.Http["@sharedRoute"]} />,
    );
  }

  const decoratorOutput = ay.join(decorators, { joiner: "\n", ender: "\n" });
  return <>
    {decoratorOutput}<tsp.OperationDeclaration name={printIdentifier(props.name)} returnType={props.returnType}>
      <tsp.OperationDeclaration.Parameters>
        {props.operationParameters}
      </tsp.OperationDeclaration.Parameters>
    </tsp.OperationDeclaration>
  </>;
}

function getRequestBodyAndContentTypeParams(
  requestBody: OpenAPI3RequestBody,
  mediaTypeRange: string,
) {
  const hasMultipleContents = Object.keys(requestBody.content).length > 1;

  // TODO: figure out if we can use the default contentType and omit the contentType header if we can.

  // TODO: figure out what to do with extensions on the requestBody
  const content = requestBody.content[mediaTypeRange];

  const bodyType = content.schema ?
    <SchemaExpression schema={content.schema} />
  : <tsp.TypeExpression builtin="bytes" />;

  const bodyParam =
    <>
    <tsp.DecoratorExpression refkey={httpLib.Http["@body"]} />
    <tsp.ModelProperty name="body" optional={!requestBody.required} type={bodyType} />
  </>;

  return <>
    <ParameterExpression parameter={{name: "contentType", in: "header", required: true, schema: {type: "string", const: mediaTypeRange }}} />
    {bodyParam}
  </>;
}

function upsertMatchingParameter(
  resolveReference: OpenApiContext["resolveReference"],
  parameterList: Refable<OpenAPI3Parameter>[],
  parameter: Refable<OpenAPI3Parameter>,
): void {
  // parameters are uniquely identified by a combination of their `name` and `in` (location).
  // if a parameter is a $ref, we need to resolve the ref first to get the `name`/`in` fields.
  const newParameterKey = getParameterIdentifier(resolveReference, parameter);

  for (let i = 0; i < parameterList.length; i++) {
    if (
      getParameterIdentifier(resolveReference, parameterList[i]) ===
      newParameterKey
    ) {
      // Found a matching parameter - replace it
      parameterList.splice(i, 1, parameter);
      return;
    }
  }

  parameterList.push(parameter);
}

function getParameterIdentifier(
  resolveReference: OpenApiContext["resolveReference"],
  parameter: Refable<OpenAPI3Parameter>,
): string {
  if ("$ref" in parameter) {
    const ref = resolveReference<OpenAPI3Parameter>(parameter.$ref);
    if (!ref) {
      throw new Error(`Unable to resolve parameter at ${parameter.$ref}`);
    }
    return `${ref.name}-${ref.in}`;
  } else {
    return `${parameter.name}-${parameter.in}`;
  }
}
