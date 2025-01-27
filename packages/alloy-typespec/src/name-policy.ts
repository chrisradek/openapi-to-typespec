import { createNamePolicy, NamePolicy, useNamePolicy } from "@alloy-js/core";
import { printIdentifier } from "@typespec/compiler";
import { camelCase, pascalCase } from "change-case";

export type TypeSpecElements =
  | "alias"
  | "scalar"
  | "interface"
  | "namespace"
  | "model"
  | "model-property"
  | "union"
  | "union-variant"
  | "enum"
  | "enum-member"
  | "operation"
  | "operation-parameter";

export function createTypeSpecNamePolicy(): NamePolicy<TypeSpecElements> {
  return createNamePolicy((name, element) => {
    switch (element) {
      case "model":
      case "interface":
      case "namespace":
      case "enum":
      case "enum-member":
      case "scalar":
      case "union":
        return printIdentifier(pascalCase(name, { prefixCharacters: "@" }));
      default:
        return printIdentifier(camelCase(name, { prefixCharacters: "@" }));
    }
  });
}

export function useTypeSpecNamePolicy(): NamePolicy<TypeSpecElements> {
  return useNamePolicy();
}
