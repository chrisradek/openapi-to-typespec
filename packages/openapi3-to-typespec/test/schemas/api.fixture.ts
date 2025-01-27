import OpenAPIParser from "@readme/openapi-parser";
import { createOpenApiContext } from "../../src/context/openapi.js";
import { OpenAPIDocument3_1 } from "../../src/openapi-types.js";

export type StricterOpenAPIDocument = OpenAPIDocument3_1 & {
  components: NonNullable<OpenAPIDocument3_1["components"]>;
} & {
  components: {
    schemas: NonNullable<
      NonNullable<OpenAPIDocument3_1["components"]>["schemas"]
    >;
    parameters: NonNullable<
      NonNullable<OpenAPIDocument3_1["components"]>["parameters"]
    >;
  };
};

export const api: StricterOpenAPIDocument = {
  openapi: "3.1.0",
  info: {
    title: "Test API",
    version: "1.0.0",
  },
  components: {
    headers: {
      "X-Rate-Limit-Limit": {
        description: "The number of allowed requests in the current period",
        schema: {
          type: "integer",
        },
      },
    },
    parameters: {
      ReferenceMe: {
        in: "header",
        name: "referenceMe",
        schema: {
          type: "string",
        },
      },
    },
    schemas: {
      Cat: {
        allOf: [
          { $ref: "#/components/schemas/Pet" },
          {
            type: "object",
            required: ["kind", "meow"],
            properties: {
              kind: { type: "string", enum: ["cat"] },
              meow: { type: "string" },
            },
          },
        ],
      },
      Entity: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
      Pet: {
        type: "object",
        required: ["kind"],
        properties: {
          kind: { type: "string" },
        },
        discriminator: { propertyName: "kind" },
      },
      ReferenceMe: {
        type: "object",
        properties: {
          foo: {
            type: "string",
          },
        },
      },
      Widget: {
        type: "object",
        properties: {
          funFactor: { type: "integer", format: "int32" },
        },
        allOf: [
          { $ref: "#/components/schemas/Entity" },
          {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
        ],
      },
    },
  },
  paths: {},
};

const parser = new OpenAPIParser();
await parser.bundle(api as any);
export const openApiContext = createOpenApiContext(parser);
