import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { it } from "vitest";
import { OpenAPI3Header, Refable } from "../../src/openapi-types.js";
import { Output } from "../../src/components/Output.jsx";
import { OpenApiContext } from "../../src/context/openapi.js";
import { assertFileContents } from "../utils.jsx";
import { HeaderExpression } from "../../src/components/headers/HeaderExpression.jsx";
import { openApiContext } from "../schemas/api.fixture.js";

it("works", () => {
  const header: OpenAPI3Header = {
    schema: { type: "string" },
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <HeaderExpression name="X-Custom-Header" header={header} />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      @Http.header
      xCustomHeader?: string;
    `,
  });
});

it("sets @header name", () => {
  const header: OpenAPI3Header = {
    schema: { type: "string" },
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <HeaderExpression name="ETag" header={header} />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      @Http.header({ name: "ETag" })
      eTag?: string;
    `,
  });
});

it("works with $refs", () => {
  const header: Refable<OpenAPI3Header> = {
    $ref: "#/components/headers/X-Rate-Limit-Limit",
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <HeaderExpression name="Foo" header={header} />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      @Http.header
      foo?: integer;
    `,
  });
});
