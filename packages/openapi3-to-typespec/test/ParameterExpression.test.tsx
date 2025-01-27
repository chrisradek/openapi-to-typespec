import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { it } from "vitest";
import { OpenAPI3Parameter, Refable } from "../src/openapi-types.js";
import { Output } from "../src/components/Output.jsx";
import { OpenApiContext } from "../src/context/openapi.js";
import { api, openApiContext } from "./schemas/api.fixture.js";
import { ParameterExpression } from "../src/components/parameter/ParameterExpression.jsx";
import { assertFileContents } from "./utils.jsx";
import { ParameterDeclaration } from "../src/components/parameter/ParameterDeclaration.jsx";

it("works", () => {
  const parameter: OpenAPI3Parameter = {
    in: "header",
    name: "foo",
    schema: {
      type: "string",
    },
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <ParameterExpression parameter={parameter} />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      @Http.header
      foo?: string;
    `,
  });
});

it("spreads referenced parameters", () => {
  const parameter: Refable<OpenAPI3Parameter> = {
    $ref: "#/components/parameters/ReferenceMe",
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <ParameterDeclaration name="ReferenceMe" parameter={api.components.parameters.ReferenceMe} />

          <ParameterExpression parameter={parameter} />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      model ReferenceMe {
        @Http.header
        referenceMe?: string;
      }
      
      ...ReferenceMe;
    `,
  });
});
