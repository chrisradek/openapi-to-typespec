import * as ay from "@alloy-js/core";
import { openapi3Lib, openapiLib } from "../packages/openapi.js";
import { httpLib } from "../packages/http.js";

export interface OutputProps extends ay.OutputProps {}

export function Output({ externals, ...props }: OutputProps) {
  const externalPackages = externals ?? [httpLib, openapiLib, openapi3Lib];
  return <ay.Output {...props} externals={externalPackages} />;
}
