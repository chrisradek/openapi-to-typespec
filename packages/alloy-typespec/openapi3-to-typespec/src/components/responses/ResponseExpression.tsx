import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { useOpenApi } from "../../context/openapi.js";
import {
  OpenAPI3MediaType,
  OpenAPI3Response,
  Refable,
} from "../../openapi-types.js";
import { HeaderExpression } from "../headers/HeaderExpression.jsx";
import { httpLib } from "../../packages/http.js";
import { SchemaDecorators } from "../schema/SchemaDecorators.jsx";
import { SchemaExpression } from "../schema/SchemaExpression.jsx";
import { helperRefkeys } from "../Helpers.jsx";

type StatusCodes = string | "1XX" | "2XX" | "3XX" | "4XX" | "5XX" | "default";

export type ResponseExpressionProps = {
  statusCode: StatusCodes;
  response: Refable<OpenAPI3Response>;
};

export function ResponseExpression(props: ResponseExpressionProps) {
  const { resolveReference } = useOpenApi();

  let response = props.response;
  if ("$ref" in response) {
    response = resolveReference<OpenAPI3Response>(response.$ref)!;
  }
  const description = props.response.description ?? response.description;

  // TODO: mutlipart form data headers
  const sharedHeaders = Object.entries(response.headers ?? {}).map(([
    name,
    header,
  ]) => {
    return <HeaderExpression name={name} header={header} />;
  });

  // We need to create multiple models if there are more than 1 content entries.
  // Luckily we're really just collecting a bunch of model properties, then can
  // put them into a model expression inside our helper template.

  const contentsProps = Object.entries(response.content ?? {}).map(([
    mediaType,
    content,
  ]) => {
    return <ContentProperties mediaType={mediaType} content={content} />;
  });

  const responsesProperties: ay.Children[][] = [];
  if (!contentsProps.length && !sharedHeaders.length) {
    responsesProperties.push([]);
  } else if (!contentsProps.length && sharedHeaders.length) {
    responsesProperties.push([...sharedHeaders]);
  } else if (contentsProps.length) {
    responsesProperties.push(
      ...contentsProps.map((contents) => [...sharedHeaders, contents]),
    );
  }

  // Each `responsesProperties` element should be a distinct model expression

  const descTemplateParam = <tsp.ValueExpression value={description} />;
  const statusCodeProp = <StatusCodeProperty statusCode={props.statusCode} />;
  const helperRefKey = props.statusCode === "default" ?
    helperRefkeys.DefaultResponse
  : helperRefkeys.Response;
  return ay.mapJoin(
    responsesProperties,
    (children) => {
      return <>
      <tsp.Reference refkey={helperRefKey}/>{"<"}{descTemplateParam}, <tsp.ModelExpression>
        {statusCodeProp}
        {ay.mapJoin(children, (c) => c, { joiner: "\n"})}
      </tsp.ModelExpression>{">"}
    </>;
    },
    { joiner: " | " },
  );
}

type StatusCodePropertyProps = {
  statusCode: StatusCodes;
};

function StatusCodeProperty({ statusCode }: StatusCodePropertyProps) {
  if (statusCode === "default") return;
  if (
    typeof statusCode === "string" &&
    statusCode.length === 3 &&
    statusCode.toLowerCase().endsWith("xx")
  ) {
    const digit = parseInt(statusCode[0], 10);
    const minValue = digit * 100;
    const maxValue = minValue + 99;
    return <>
      <tsp.DecoratorExpression name="minValue">
        <tsp.ValueExpression value={minValue} />
      </tsp.DecoratorExpression>
      <tsp.DecoratorExpression name="maxValue">
        <tsp.ValueExpression value={maxValue} />
      </tsp.DecoratorExpression>
      <tsp.DecoratorExpression refkey={httpLib.Http["@statusCode"]} />
      <tsp.ModelProperty name="_" type={<tsp.TypeExpression builtin="int8" />} />
    </>;
  }

  const literalStatusCode = parseInt(statusCode, 10);
  return <>
    <tsp.DecoratorExpression refkey={httpLib.Http["@statusCode"]} />
    <tsp.ModelProperty name="_" type={<tsp.ValueExpression value={literalStatusCode} />} />
  </>;
}

type ContentPropertiesProps = {
  mediaType: string;
  content: OpenAPI3MediaType;
};

function ContentProperties(props: ContentPropertiesProps) {
  //TODO: handle empty content.schema
  return <>
    <tsp.DecoratorExpression refkey={httpLib.Http["@header"]} />
    <tsp.ModelProperty name="contentType" type={<tsp.ValueExpression value={props.mediaType} />} />
    <SchemaDecorators schema={props.content.schema!} />
    <tsp.DecoratorExpression refkey={httpLib.Http["@body"]} />
    <tsp.ModelProperty name="body" type={<SchemaExpression schema={props.content.schema!} />} />
  </>;
}
