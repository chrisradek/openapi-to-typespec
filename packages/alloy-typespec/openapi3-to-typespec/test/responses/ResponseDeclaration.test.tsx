import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { it } from "vitest";
import { OpenAPI3Response } from "../../src/openapi-types.js";
import { Output } from "../../src/components/Output.jsx";
import { OpenApiContext } from "../../src/context/openapi.js";
import { openApiContext } from "../schemas/api.fixture.js";
import { ResponseDeclaration } from "../../src/components/responses/ResponseDeclaration.jsx";
import { Helpers } from "../../src/components/Helpers.jsx";
import { assertFileContents } from "../utils.jsx";
import { GeneratedHelpers } from "../constants.js";

it("works", () => {
  const response: OpenAPI3Response = {
    description: "Super cool test!",
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <ResponseDeclaration name="Foo" response={response} />
          <Helpers />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/openapi";
      import "@typespec/http";
      alias Foo<StatusCode> = _TSP.Response<"Super cool test!", StatusCode>;
      ${GeneratedHelpers}
    `,
  });
});
