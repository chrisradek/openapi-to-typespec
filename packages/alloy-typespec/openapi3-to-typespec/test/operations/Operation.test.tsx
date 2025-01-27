import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { it } from "vitest";
import { OpenApiContext } from "../../src/context/openapi.js";
import { Output } from "../../src/components/Output.jsx";
import { assertFileContents } from "../utils.jsx";
import { api, openApiContext } from "../schemas/api.fixture.js";
import { Operation } from "../../src/components/operations/alternative.jsx";
import { OpenAPI3Operation } from "../../src/openapi-types.js";
import { ParameterDeclaration } from "../../src/components/parameter/ParameterDeclaration.jsx";

it("works", () => {
  const operation: OpenAPI3Operation = {
    operationId: "ping",
    parameters: [],
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <Operation 
            httpMethod="get"
            operation={operation}
            common={{path: "/", extensions: {}, parameters: []}}
          />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      @Http.get
      @Http.route("/")
      op ping(): void;
    `,
  });
});

it("supports parameters", () => {
  const operation: OpenAPI3Operation = {
    operationId: "ping",
    parameters: [
      { in: "header", name: "foo", schema: { type: "string" } },
      { $ref: "#/components/parameters/ReferenceMe" },
    ],
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <ParameterDeclaration name="ReferenceMe" parameter={api.components.parameters.ReferenceMe} />

          <Operation 
            httpMethod="get"
            operation={operation}
            common={{path: "/", extensions: {}, parameters: []}}
          />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  // TODO: Fix up the formatting of operation parameters
  // formatter handles this for us, but would be nice to fix for the tests
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      model ReferenceMe {
        @Http.header
        referenceMe?: string;
      }

      @Http.get
      @Http.route("/")
      op ping(
        @Http.header
        foo?: string;
        ...ReferenceMe;
      ): void;
    `,
  });
});

it("supports common parameters", () => {
  const operation: OpenAPI3Operation = {
    operationId: "ping",
    parameters: [{ $ref: "#/components/parameters/ReferenceMe" }],
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <ParameterDeclaration name="ReferenceMe" parameter={api.components.parameters.ReferenceMe} />

          <Operation 
            httpMethod="get"
            operation={operation}
            common={{path: "/", extensions: {}, parameters: [{ in: "header", name: "foo", schema: { type: "string" } }]}}
          />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  // TODO: Fix up the formatting of operation parameters
  // formatter handles this for us, but would be nice to fix for the tests
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      model ReferenceMe {
        @Http.header
        referenceMe?: string;
      }

      @Http.get
      @Http.route("/")
      op ping(
        @Http.header
        foo?: string;
        ...ReferenceMe;
      ): void;
    `,
  });
});

it("supports overriding common parameters", () => {
  const operation: OpenAPI3Operation = {
    operationId: "ping",
    parameters: [
      { $ref: "#/components/parameters/ReferenceMe" },
      { in: "header", name: "foo", required: true, schema: { type: "string" } },
    ],
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <ParameterDeclaration name="ReferenceMe" parameter={api.components.parameters.ReferenceMe} />

          <Operation 
            httpMethod="get"
            operation={operation}
            common={{path: "/", extensions: {}, parameters: [{ in: "header", name: "foo", schema: { type: "string" } }]}}
          />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  // TODO: Fix up the formatting of operation parameters
  // formatter handles this for us, but would be nice to fix for the tests
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      model ReferenceMe {
        @Http.header
        referenceMe?: string;
      }

      @Http.get
      @Http.route("/")
      op ping(
        @Http.header
        foo: string;
        ...ReferenceMe;
      ): void;
    `,
  });
});

it("supports body parameters", () => {
  const operation: OpenAPI3Operation = {
    operationId: "send",
    parameters: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              foo: { type: "string" },
            },
            required: ["foo"],
          },
        },
      },
    },
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <Operation 
            httpMethod="post"
            operation={operation}
            common={{path: "/", extensions: {}, parameters: []}}
          />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      @Http.post
      @Http.route("/")
      op send(
        @Http.header
        contentType: "application/json";
        @Http.body
        body?: {
          foo: string;
        };
      ): void;
    `,
  });
});

it("supports shared operations", () => {
  const operation: OpenAPI3Operation = {
    operationId: "send",
    parameters: [],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              foo: { type: "string" },
            },
            required: ["foo"],
          },
        },
        "application/x-www-form-urlencoded": {
          schema: {
            type: "object",
            properties: {
              bar: { type: "string" },
            },
            required: ["bar"],
          },
        },
      },
    },
  };
  const output = ay.render(
    <Output>
      <OpenApiContext.Provider value={openApiContext}>
        <tsp.SourceFile path="main.tsp">
          <Operation 
            httpMethod="post"
            operation={operation}
            common={{path: "/", extensions: {}, parameters: []}}
          />
        </tsp.SourceFile>
      </OpenApiContext.Provider>
    </Output>,
  );
  assertFileContents(output, {
    "main.tsp": `
      import "@typespec/http";
      @Http.post
      @Http.route("/")
      @Http.sharedRoute
      op sendJson(
        @Http.header
        contentType: "application/json";
        @Http.body
        body?: {
          foo: string;
        };
      ): void;
      @Http.post
      @Http.route("/")
      @Http.sharedRoute
      op sendXWWWFormUrlencoded(
        @Http.header
        contentType: "application/x-www-form-urlencoded";
        @Http.body
        body?: {
          bar: string;
        };
      ): void;
    `,
  });
});
