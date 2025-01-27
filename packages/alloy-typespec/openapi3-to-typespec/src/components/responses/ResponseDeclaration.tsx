import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { useOpenApi } from "../../context/openapi.js";
import { OpenAPI3Response, Refable } from "../../openapi-types.js";
import { helperRefkeys } from "../Helpers.jsx";

export interface ResponseDeclarationProps {
  name: string;
  response: Refable<OpenAPI3Response>;
  default?: boolean;
}

export function ResponseDeclaration(props: ResponseDeclarationProps) {
  const { resolveReference } = useOpenApi();
  // Goal is to generate a template alias that is set to a union of responses.
  // Example:
  // alias MyResponses<StatusCode> = _TSP.Response<StatusCode, <Description>, { <Response Props> }

  const declRefkey = ay.refkey(props.response);

  let response = props.response;
  if ("$ref" in response) {
    // TODO: Eventually need to be able to override extensions/summary info.
    // TODO: don't stop resolving until we're certain there are no more $ref
    response = resolveReference<OpenAPI3Response>(response.$ref)!;
  }

  const description = props.response.description ?? response.description;

  const type =
    <>
    <tsp.Reference
      refkey={helperRefkeys.Response}
    />{"<"}<tsp.ValueExpression value={description} />, StatusCode{">"}
  </>;

  return <tsp.AliasDeclaration
    name={props.name}
    refkey={declRefkey}
    templateParameters="StatusCode"
    type={type}
  />;
}

// .headers and .content
// .headers turns into header parameters
// .content turns into contentType/body

export interface ResponsePropertiesProps {
  headers: OpenAPI3Response["headers"];
  mediaType?: string;
}

export function ResponseProperties(props: ResponsePropertiesProps) {
  // Get @headers from `.headers`
  // Get @header contentType and @body body from `.content`

  return <tsp.ModelExpression></tsp.ModelExpression>;
}
