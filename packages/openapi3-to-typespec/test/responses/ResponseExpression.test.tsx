import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { it } from "vitest";
import { Output } from "../../src/components/Output.jsx";
import { OpenApiContext } from "../../src/context/openapi.js";
import { openApiContext } from "../schemas/api.fixture.js";
import { assertFileContents } from "../utils.jsx";
import { OpenAPI3Response } from "../../src/openapi-types.js";
import { ResponseExpression } from "../../src/components/responses/ResponseExpression.jsx";
import { Helpers } from "../../src/components/Helpers.jsx";
import { GeneratedHelpers } from "../constants.js";

it("works", () => {
  const response: OpenAPI3Response = {
    description: "Test Response",
    headers: {
      "X-Foo": {
        schema: { type: "string" },
      },
    },
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
          },
          required: ["id"],
        },
      },
    },
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <ResponseExpression statusCode="200" response={response} />
          <Helpers />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      import "@typespec/openapi";
      _TSP.Response<"Test Response", {
        @Http.statusCode
        _: 200;
        @Http.header
        xFoo?: string;
        @Http.header
        contentType: "application/json";
        
        @Http.body
        body: {
          id: string;
          name?: string;
        };
      }>
      ${GeneratedHelpers}
    `,
  });
});
