import { createPackage } from "alloy-typespec";

export const openapiLib = createPackage({
  name: "@typespec/openapi",
  version: "0.63.0",
  descriptor: {
    ".": {
      OpenAPI: ["@defaultResponse", "@extension", "@info"],
    },
  },
});

export const openapi3Lib = createPackage({
  name: "@typespec/openapi3",
  version: "0.63.0",
  descriptor: {
    ".": {
      OpenAPI: ["@oneOf"],
    },
  },
});
