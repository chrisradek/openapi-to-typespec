import OpenAPIParser from "@readme/openapi-parser";
// import { openapi } from "./weather.js";
import { openapi } from "./petstore.js";
import { OpenAPIDocument3_1 } from "./openapi-types.js";
import * as ay from "@alloy-js/core";
import {
  createOpenApiContext,
  OpenApiContext,
  useOpenApi,
} from "./context/openapi.js";
import * as tsp from "alloy-typespec";
import { ServiceNamespace } from "./components/ServiceNamespace.jsx";
import { openapiLib } from "./packages/openapi.js";
import { SchemaDeclaration } from "./components/schema/SchemaDeclaration.jsx";
import { Output } from "./components/Output.jsx";
import { PathItem } from "./components/operations/alternative.jsx";
import { ParameterDeclaration } from "./components/parameter/ParameterDeclaration.jsx";
import { Helpers } from "./components/Helpers.jsx";
import { ResponseDeclaration } from "./components/responses/ResponseDeclaration.jsx";
import { printIdentifier } from "@typespec/compiler";

async function emit() {
  const parser = new OpenAPIParser();
  try {
    const api = (await parser.bundle(openapi as any)) as OpenAPIDocument3_1;
    const output = await generateTypeSpec(api);

    ay.writeOutput(output);
  } catch (err) {
    console.error(err);
  }
}

emit();

async function generateTypeSpec(
  api: OpenAPIDocument3_1,
): Promise<ay.OutputDirectory> {
  const parser = new OpenAPIParser();
  await parser.bundle(api as any);
  const openApiContext = createOpenApiContext(parser);
  return ay.render(
    <Output namePolicy={ay.createNamePolicy((name) => printIdentifier(name))}>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.PackageDirectory name="todo" path="oa3-output" version="1.0.0">
          <tsp.SourceFile path="main.tsp" export=".">
            <ServiceNamespace>
              // Models
              <SchemaDeclarations />

              // Parameters
              <ParameterDeclarations />

              // Responses
              <ResponsesDeclarations />

              // Operations
              <Paths />

              <Helpers />
            </ServiceNamespace>
          </tsp.SourceFile>
        </tsp.PackageDirectory>
      </OpenApiContext.Provider>
    </Output>,
  );
}

export function SchemaDeclarations() {
  const { document } = useOpenApi();
  const schemas = document.components?.schemas ?? {};

  return ay.mapJoin(
    Object.entries(schemas),
    ([name, schema]) => {
      return <SchemaDeclaration name={name} schema={schema} />;
    },
    { joiner: "\n" },
  );
}

export function ParameterDeclarations() {
  const { document } = useOpenApi();
  const parameters = document.components?.parameters ?? {};

  return ay.mapJoin(
    Object.entries(parameters),
    ([name, parameter]) => {
      return <ParameterDeclaration name={name} parameter={parameter} />;
    },
    { joiner: "\n" },
  );
}

export function ResponsesDeclarations() {
  const { document } = useOpenApi();
  const responses = document.components?.responses ?? {};

  return ay.mapJoin(
    Object.entries(responses),
    ([name, response]) => {
      return <ResponseDeclaration name={name} response={response} />;
    },
    { joiner: "\n" },
  );
}

export function Paths() {
  const { document } = useOpenApi();
  const paths = document.paths;

  return ay.mapJoin(
    Object.entries(paths),
    ([path, pathItem]) => {
      return <PathItem path={path} pathItem={pathItem} />;
    },
    { joiner: "\n\n" },
  );
}
