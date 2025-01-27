import { Binder, OutputScope, useScope } from "@alloy-js/core";
import { TypeSpecModuleScope } from "./typespec-module-scope.js";
import { TypeSpecMemberScope } from "./typespec-member-scope.js";
import { TypeSpecPackageScope } from "./typespec-package-scope.js";

export type TypeSpecOutputScope =
  | TypeSpecPackageScope
  | TypeSpecModuleScope
  | TypeSpecNamespaceScope
  | TypeSpecOperationScope;

export interface TypeSpecNamespaceScope extends OutputScope {
  kind: "namespace";
}

export function createTypeSpecNamespaceScope(
  binder: Binder,
  parent: OutputScope | undefined,
  name: string,
): TypeSpecNamespaceScope {
  return binder.createScope<TypeSpecNamespaceScope>({
    kind: "namespace",
    name,
    parent,
  });
}

export interface TypeSpecOperationScope extends OutputScope {
  kind: "operation";
}

export function useTypeSpecScope(): TypeSpecOutputScope {
  return useScope() as TypeSpecOutputScope;
}
