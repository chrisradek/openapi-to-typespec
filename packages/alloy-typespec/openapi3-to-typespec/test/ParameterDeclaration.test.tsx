import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { it } from "vitest";
import { OpenAPI3Parameter } from "../src/openapi-types.js";
import { Output } from "../src/components/Output.jsx";
import { OpenApiContext } from "../src/context/openapi.js";
import { ParameterDeclaration } from "../src/components/parameter/ParameterDeclaration.jsx";
import { assertFileContents } from "./utils.jsx";
import { openApiContext } from "./schemas/api.fixture.js";

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
          <ParameterDeclaration name="Foo" parameter={parameter} />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      model Foo {
        @Http.header
        foo?: string;
      }
    `,
  });
});

it("supports schema decorators", () => {
  const parameter: OpenAPI3Parameter = {
    in: "header",
    name: "foo",
    schema: {
      type: "string",
      minLength: 1,
      maxLength: 10,
      "x-foo": "test",
    },
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <ParameterDeclaration name="Foo" parameter={parameter} />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      import "@typespec/openapi";
      model Foo {
        @Http.header
        @minLength(1)
        @maxLength(10)
        @OpenAPI.extension("x-foo", "test")
        foo?: string;
      }
    `,
  });
});

it("is referenceable", () => {
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
          <ParameterDeclaration name="Foo" parameter={parameter} />

          {ay.refkey(parameter)}
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      model Foo {
        @Http.header
        foo?: string;
      }

      Foo
    `,
  });
});
