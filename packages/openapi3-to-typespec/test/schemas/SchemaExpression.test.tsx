import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { describe, it } from "vitest";
import { OpenAPISchema3_1 } from "../../src/openapi-types.js";
import { Output } from "../../src/components/Output.jsx";
import { OpenApiContext } from "../../src/context/openapi.js";
import { openApiContext } from "./api.fixture.js";
import { SchemaExpression } from "../../src/components/schema/SchemaExpression.jsx";
import { assertFileContents } from "../utils.jsx";

describe(`type: "boolean"`, () => {
  it("is a boolean typespec type", () => {
    const schema: OpenAPISchema3_1 = { type: "boolean" };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        boolean
      `,
    });
  });

  it("supports const as literal type", () => {
    const schema: OpenAPISchema3_1 = { type: "boolean", const: false };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        false
      `,
    });
  });
});

describe(`type: "integer"`, () => {
  it.each<{ format?: string; tspType: string }>([
    { tspType: "integer" },
    { format: "int8", tspType: "int8" },
    { format: "int16", tspType: "int16" },
    { format: "int32", tspType: "int32" },
    { format: "int64", tspType: "int64" },
    { format: "uint8", tspType: "uint8" },
    { format: "uint16", tspType: "uint16" },
    { format: "uint32", tspType: "uint32" },
    { format: "uint64", tspType: "uint64" },
    { format: "double-int", tspType: "safeint" },
  ])("converts format $format to typespec type $tspType", ({
    format,
    tspType,
  }) => {
    const schema: OpenAPISchema3_1 = { type: "integer", format };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        ${tspType}
      `,
    });
  });

  it("supports enums as union expressions", () => {
    const schema: OpenAPISchema3_1 = { type: "integer", enum: [3, 42] };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        3 | 42
      `,
    });
  });

  it("supports const as literal type", () => {
    const schema: OpenAPISchema3_1 = { type: "integer", const: 0 };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        0
      `,
    });
  });
});

describe(`type: "number"`, () => {
  it.each<{ format?: string; tspType: string }>([
    { tspType: "numeric" },
    { format: "decimal", tspType: "decimal" },
    { format: "decimal128", tspType: "decimal128" },
    { format: "double", tspType: "float64" },
    { format: "float", tspType: "float32" },
  ])("converts format $format to typespec type $tspType", ({
    format,
    tspType,
  }) => {
    const schema: OpenAPISchema3_1 = { type: "number", format };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        ${tspType}
      `,
    });
  });

  it("supports enums as union expressions", () => {
    const schema: OpenAPISchema3_1 = { type: "number", enum: [3.14, 6.28] };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        3.14 | 6.28
      `,
    });
  });

  it("supports const as literal type", () => {
    const schema: OpenAPISchema3_1 = { type: "number", const: 3.14 };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        3.14
      `,
    });
  });
});

describe(`type: "string"`, () => {
  // TODO: binary types
  it.each<{ format?: string; tspType: string }>([
    { tspType: "string" },
    { format: "date", tspType: "plainDate" },
    { format: "date-time", tspType: "utcDateTime" },
    { format: "duration", tspType: "duration" },
    { format: "time", tspType: "plainTime" },
    { format: "uri", tspType: "url" },
  ])("converts format $format to typespec type $tspType", ({
    format,
    tspType,
  }) => {
    const schema: OpenAPISchema3_1 = { type: "string", format };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        ${tspType}
      `,
    });
  });

  it("supports enums as union expressions", () => {
    const schema: OpenAPISchema3_1 = { type: "string", enum: ["foo", "bar"] };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        "foo" | "bar"
      `,
    });
  });

  it("supports const as literal type", () => {
    const schema: OpenAPISchema3_1 = { type: "string", const: "pi" };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        "pi"
      `,
    });
  });
});

describe(`type: "null"`, () => {
  it("is a null typespec type", () => {
    const schema: OpenAPISchema3_1 = { type: "null" };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        null
      `,
    });
  });
});

describe(`type: "array"`, () => {
  it("is an array typespec type", () => {
    const schema: OpenAPISchema3_1 = {
      type: "array",
      items: { type: "string" },
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        string[]
      `,
    });
  });

  it("supports nesting", () => {
    const schema: OpenAPISchema3_1 = {
      type: "array",
      items: { type: "array", items: { type: "string" } },
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        string[][]
      `,
    });
  });

  it("supports tuples", () => {
    // Note: partial tuples only supported as scalar declarations or model properties
    // Need to eventually have a diagnostic for this in an expression.
    // (partial tuples are arrays where the first N elements are explicitly defined)
    const schema: OpenAPISchema3_1 = {
      type: "array",
      prefixItems: [{ type: "string" }],
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        [string]
      `,
    });
  });
});

describe(`type: "object"`, () => {
  it("creates a model expression", () => {
    const schema: OpenAPISchema3_1 = {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        {
          id: string;
        }
      `,
    });
  });

  it("creates a record if additionalProperties with no properties", () => {
    const schema: OpenAPISchema3_1 = {
      type: "object",
      additionalProperties: { type: "string" },
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        Record<string>
      `,
    });
  });

  it("spreads additionalProperties if properties also defined", () => {
    const schema: OpenAPISchema3_1 = {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      additionalProperties: { type: "string" },
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        {
          id?: string;
          ...Record<string>;
        }
      `,
    });
  });

  it("adds decorators to model properties", () => {
    const schema: OpenAPISchema3_1 = {
      type: "object",
      properties: {
        id: { type: "string", minLength: 1, maxLength: 10, "x-foo": "test" },
      },
      required: ["id"],
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaExpression schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        import "@typespec/openapi";
        {
          @minLength(1)
          @maxLength(10)
          @OpenAPI.extension("x-foo", "test")
          id: string;
        }
      `,
    });
  });
});
