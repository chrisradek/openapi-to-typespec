import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { describe, it } from "vitest";
import {
  createOpenApiContext,
  OpenApiContext,
} from "../../src/context/openapi.js";
import { api, openApiContext } from "./api.fixture.js";
import { SchemaDeclaration } from "../../src/components/schema/SchemaDeclaration.jsx";
import { assertFileContents } from "../utils.jsx";
import { OpenAPISchema3_1, Refable } from "../../src/openapi-types.js";
import { Output } from "../../src/components/Output.jsx";

describe("aliases", () => {
  it("null", () => {
    const schema: OpenAPISchema3_1 = { type: "null" };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        alias Foo = null;
      `,
    });
  });

  it("$refs", () => {
    const schema: Refable<OpenAPISchema3_1> = {
      $ref: "#/components/schemas/ReferenceMe",
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="ReferenceMe" schema={api.components.schemas.ReferenceMe} />
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model ReferenceMe {
          foo?: string;
        }
        alias Foo = ReferenceMe;
      `,
    });
  });

  it("is referenceable", () => {
    const schema: Refable<OpenAPISchema3_1> = {
      $ref: "#/components/schemas/ReferenceMe",
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="ReferenceMe" schema={api.components.schemas.ReferenceMe} />
            <SchemaDeclaration name="Foo" schema={schema} />

            {ay.refkey(schema)}
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model ReferenceMe {
          foo?: string;
        }
        alias Foo = ReferenceMe;

        Foo
      `,
    });
  });

  it("supports the name policy", () => {
    const schema: OpenAPISchema3_1 = { type: "null" };
    const output = ay.render(
      <Output namePolicy={tsp.createTypeSpecNamePolicy()}>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        alias foo = null;
      `,
    });
  });
});

describe("arrays", () => {
  it("simple indexes", () => {
    const schema: OpenAPISchema3_1 = {
      type: "array",
      items: { type: "string" },
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model Foo is Array<string>;
      `,
    });
  });

  it("object indexes", () => {
    const schema: OpenAPISchema3_1 = {
      type: "array",
      items: { type: "object", properties: { foo: { type: "string" } } },
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model Foo is Array<{
          foo?: string;
        }>;
      `,
    });
  });

  it("union indexes", () => {
    const schema: OpenAPISchema3_1 = {
      type: "array",
      items: { type: "string", enum: ["a", "b", "c"] },
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model Foo is Array<"a" | "b" | "c">;
      `,
    });
  });

  it("$ref indexes", () => {
    const schema: OpenAPISchema3_1 = {
      type: "array",
      items: { $ref: "#/components/schemas/ReferenceMe" },
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="ReferenceMe" schema={api.components.schemas.ReferenceMe} />
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model ReferenceMe {
          foo?: string;
        }
        model Foo is Array<ReferenceMe>;
      `,
    });
  });

  it("is referenceable", () => {
    const schema: OpenAPISchema3_1 = {
      type: "array",
      items: { type: "string" },
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />

            {ay.refkey(schema)}
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model Foo is Array<string>;

        Foo
      `,
    });
  });

  it("supports the name policy", () => {
    const schema: OpenAPISchema3_1 = {
      type: "array",
      items: { type: "string" },
    };
    const output = ay.render(
      <Output namePolicy={tsp.createTypeSpecNamePolicy()}>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model Foo is Array<string>;
      `,
    });
  });
});

describe("enums", () => {
  it("supports string enums", () => {
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={{ type: "string", enum: ["a", "b", "c"]}} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        enum Foo {
          a: "a",
          b: "b",
          c: "c",
        }
      `,
    });
  });

  it("supports number enums", () => {
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={{ type: "number", enum: [1, 3.14]}} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        enum Foo {
          \`1\`: 1,
          \`3.14\`: 3.14,
        }
      `,
    });
  });

  it("supports integer enums", () => {
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={{ type: "integer", enum: [1, 2]}} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        enum Foo {
          \`1\`: 1,
          \`2\`: 2,
        }
      `,
    });
  });

  it("supports numeric enums", () => {
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={{ type: ["integer", "number"], enum: [1, 3.14]}} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        enum Foo {
          \`1\`: 1,
          \`3.14\`: 3.14,
        }
      `,
    });
  });

  it("supports mixed enums", () => {
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={{ type: ["integer", "number", "string"], enum: [1, 3.14, "pi"]}} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        enum Foo {
          \`1\`: 1,
          \`3.14\`: 3.14,
          pi: "pi",
        }
      `,
    });
  });

  it("supports name policy", () => {
    const output = ay.render(
      <Output namePolicy={tsp.createTypeSpecNamePolicy()}>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={{ type: "string", enum: ["a", "b", "c"]}} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        enum Foo {
          A: "a",
          B: "b",
          C: "c",
        }
      `,
    });
  });

  it("is referenceable", () => {
    const schema: OpenAPISchema3_1 = { type: "string", enum: ["a", "b", "c"] };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />

            <tsp.Reference refkey={ay.refkey(schema)} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        enum Foo {
          a: "a",
          b: "b",
          c: "c",
        }
        
        Foo
      `,
    });
  });
});

describe("models", () => {
  it("works with properties", () => {
    const schema: OpenAPISchema3_1 = {
      type: "object",
      properties: {
        id: { type: "string" },
        entity: { $ref: "#/components/schemas/ReferenceMe" },
      },
      required: ["id"],
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="ReferenceMe" schema={api.components.schemas.ReferenceMe} />
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model ReferenceMe {
          foo?: string;
        }
        model Foo {
          id: string;
          entity?: ReferenceMe;
        }
      `,
    });
  });

  it("properties and additionalProperties", () => {
    const schema: OpenAPISchema3_1 = {
      type: "object",
      properties: {
        id: { type: "string" },
        entity: { $ref: "#/components/schemas/ReferenceMe" },
      },
      required: ["id"],
      additionalProperties: { type: "string" },
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="ReferenceMe" schema={api.components.schemas.ReferenceMe} />
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model ReferenceMe {
          foo?: string;
        }
        model Foo {
          id: string;
          entity?: ReferenceMe;
          ...Record<string>;
        }
      `,
    });
  });

  it("additionalProperties", () => {
    const schema: OpenAPISchema3_1 = {
      type: "object",
      additionalProperties: { type: "string" },
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model Foo {
          ...Record<string>;
        }
      `,
    });
  });

  it("extends when allOf contains 1 entry with a discriminator", () => {
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Pet" schema={api.components.schemas.Pet} />
            <SchemaDeclaration name="Cat" schema={api.components.schemas.Cat} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        @discriminator("kind")
        model Pet {
          kind: string;
        }
        model Cat extends Pet {
          kind: "cat";
          meow: string;
        }
      `,
    });
  });

  it("allOf with composition", () => {
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Entity" schema={api.components.schemas.Entity} />
            <SchemaDeclaration name="Widget" schema={api.components.schemas.Widget} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model Entity {
          id: string;
        }
        model Widget {
          ...Entity;
          name: string;
          funFactor?: int32;
        }
      `,
    });
  });

  it("supports name policy", () => {
    const schema: OpenAPISchema3_1 = {
      type: "object",
      properties: {
        Id: { type: "string" },
        Entity: { $ref: "#/components/schemas/ReferenceMe" },
      },
      required: ["Id"],
    };
    const output = ay.render(
      <Output namePolicy={tsp.createTypeSpecNamePolicy()}>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="ReferenceMe" schema={api.components.schemas.ReferenceMe} />
            <SchemaDeclaration name="foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model ReferenceMe {
          foo?: string;
        }
        model Foo {
          id: string;
          entity?: ReferenceMe;
        }
      `,
    });
  });

  it("supports decorators on model properties", () => {
    const schema: OpenAPISchema3_1 = {
      type: "object",
      properties: {
        id: { type: "string", minLength: 1, maxLength: 10, "x-foo": "test" },
        entity: { $ref: "#/components/schemas/ReferenceMe", "x-bar": "test2" },
      },
      required: ["id"],
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="ReferenceMe" schema={api.components.schemas.ReferenceMe} />
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        import "@typespec/openapi";
        model ReferenceMe {
          foo?: string;
        }
        model Foo {
          @minLength(1)
          @maxLength(10)
          @OpenAPI.extension("x-foo", "test")
          id: string;
          @OpenAPI.extension("x-bar", "test2")
          entity?: ReferenceMe;
        }
      `,
    });
  });
});

describe("scalars", () => {
  it("works", () => {
    const schema: OpenAPISchema3_1 = {};
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );

    assertFileContents(output, {
      "main.tsp": `
        scalar Foo;
      `,
    });
  });

  it("extends base", () => {
    const schema: OpenAPISchema3_1 = { type: "string" };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );

    assertFileContents(output, {
      "main.tsp": `
        scalar Foo extends string;
      `,
    });
  });

  it("supports name policy", () => {
    const schema: OpenAPISchema3_1 = {};
    const output = ay.render(
      <Output namePolicy={tsp.createTypeSpecNamePolicy()}>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );

    assertFileContents(output, {
      "main.tsp": `
        scalar Foo;
      `,
    });
  });

  it("is referenceable", () => {
    const schema: OpenAPISchema3_1 = {};
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />

            <tsp.Reference refkey={ay.refkey(schema)} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );

    assertFileContents(output, {
      "main.tsp": `
        scalar Foo;

        Foo
      `,
    });
  });

  it("is referenceable with name policy", () => {
    const schema: OpenAPISchema3_1 = {};
    const output = ay.render(
      <Output namePolicy={tsp.createTypeSpecNamePolicy()}>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="foo" schema={schema} />

            <tsp.Reference refkey={ay.refkey(schema)} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );

    assertFileContents(output, {
      "main.tsp": `
        scalar Foo;

        Foo
      `,
    });
  });

  it.skip.each(["number", "integer"] as const)("supports %s decorators", (
    schemaType,
  ) => {
    const schema: OpenAPISchema3_1 = {
      type: schemaType,
      maxLength: 5,
      minLength: 1,
      pattern: "^[A-Z]+$",
      format: "custom-format",
      "x-foo": "custom",
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );

    assertFileContents(output, {
      "main.tsp": `
        import "@typespec/openapi";
        @minLength(1)
        @maxLength(5)
        @pattern("^[A-Z]+$")
        @format("custom-format")
        @OpenAPI.extension("x-foo", "custom")
        scalar Foo extends string;
      `,
    });
  });

  it("supports string decorators", () => {
    const schema: OpenAPISchema3_1 = {
      type: "string",
      maxLength: 5,
      minLength: 1,
      pattern: "^[A-Z]+$",
      format: "custom-format",
      "x-foo": "custom",
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );

    assertFileContents(output, {
      "main.tsp": `
        import "@typespec/openapi";
        @minLength(1)
        @maxLength(5)
        @pattern("^[A-Z]+$")
        @format("custom-format")
        @OpenAPI.extension("x-foo", "custom")
        scalar Foo extends string;
      `,
    });
  });
});

describe("unions", () => {
  it("supports additional enum types", () => {
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={{ type: ["string", "boolean", "null"], enum: ["a", false, null]}} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        union Foo {
          "a",
          false,
          null,
        }
      `,
    });
  });

  it("supports anyOf", () => {
    const schema: OpenAPISchema3_1 = {
      anyOf: [
        { $ref: "#/components/schemas/ReferenceMe" },
        { type: "string", const: "constant" },
        { type: "null" },
      ],
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="ReferenceMe" schema={api.components.schemas.ReferenceMe} />
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        model ReferenceMe {
          foo?: string;
        }
        union Foo {
          ReferenceMe,
          "constant",
          null,
        }
      `,
    });
  });

  it("supports oneOf", () => {
    const schema: OpenAPISchema3_1 = {
      oneOf: [
        { $ref: "#/components/schemas/ReferenceMe" },
        { type: "string", const: "constant" },
        { type: "null" },
      ],
    };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={openApiContext}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="ReferenceMe" schema={api.components.schemas.ReferenceMe} />
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        import "@typespec/openapi3";
        model ReferenceMe {
          foo?: string;
        }
        @OpenAPI.oneOf
        union Foo {
          ReferenceMe,
          "constant",
          null,
        }
      `,
    });
  });

  it("supports type arrays", () => {
    const schema: OpenAPISchema3_1 = { type: ["string", "boolean", "null"] };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        union Foo {
          string,
          boolean,
          null,
        }
      `,
    });
  });

  it("supports name policy", () => {
    const schema: OpenAPISchema3_1 = { type: ["string", "boolean", "null"] };
    const output = ay.render(
      <Output namePolicy={tsp.createTypeSpecNamePolicy()}>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="foo" schema={schema} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        union Foo {
          string,
          boolean,
          null,
        }
      `,
    });
  });

  it("is referenceable", () => {
    const schema: OpenAPISchema3_1 = { type: ["string", "boolean", "null"] };
    const output = ay.render(
      <Output>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="Foo" schema={schema} />

            <tsp.Reference refkey={ay.refkey(schema)} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        union Foo {
          string,
          boolean,
          null,
        }

        Foo
      `,
    });
  });

  it("is referenceable with name policy", () => {
    const schema: OpenAPISchema3_1 = { type: ["string", "boolean", "null"] };
    const output = ay.render(
      <Output namePolicy={tsp.createTypeSpecNamePolicy()}>
        <OpenApiContext.Provider value={createOpenApiContext(api as any)}>
          <tsp.SourceFile path="main.tsp">
            <SchemaDeclaration name="foo" schema={schema} />

            <tsp.Reference refkey={ay.refkey(schema)} />
          </tsp.SourceFile>
        </OpenApiContext.Provider>
      </Output>,
    );
    assertFileContents(output, {
      "main.tsp": `
        union Foo {
          string,
          boolean,
          null,
        }

        Foo
      `,
    });
  });
});
