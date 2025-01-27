import * as ay from "@alloy-js/core";
import { DecoratorExpression, Namespace } from "alloy-typespec";
import { useOpenApi } from "../context/openapi.js";
import { LegacyModelExpression } from "./LegacyModelExpression.jsx";
import { openapiLib } from "../packages/openapi.js";

export interface ServiceNamespaceProps {
  children?: ay.Children;
}

export function ServiceNamespace(props: ServiceNamespaceProps) {
  const { document } = useOpenApi();
  const info = document.info;
  const title = info.title;

  const namespaceName = title?.replaceAll(/[^\w\d_]+/g, "") ?? "Service";

  return <>
    <DecoratorExpression name="service">
      <LegacyModelExpression value={{ title }} />
    </DecoratorExpression>
    <DecoratorExpression refkey={openapiLib.OpenAPI["@info"]}>
      <LegacyModelExpression value={{
        version: info.version,
        contact: info.contact,
        license: info.license,
        termsOfService: info.termsOfService,
        summary: info.summary
      }} />
    </DecoratorExpression>
    <Namespace fileLevel name={namespaceName}>
      {props.children}
    </Namespace>
  </>;
}
