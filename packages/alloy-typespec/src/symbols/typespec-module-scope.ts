import { Binder, OutputScope } from "@alloy-js/core";
import { TypeSpecNamespaceScope } from "./scopes.js";

export interface TypeSpecModuleScope extends OutputScope {
  kind: "module";
  fileNamespace?: TypeSpecNamespaceScope;
  setFileNamespace(namespace: TypeSpecNamespaceScope): void;
  importedModules: Set<TypeSpecModuleScope>;
  addImport(module: TypeSpecModuleScope): void;
  usings: Set<TypeSpecNamespaceScope>;
  addUsing(using: TypeSpecNamespaceScope): void;
}

export function createTypeSpecModuleScope(
  binder: Binder,
  parent: OutputScope,
  path: string,
): TypeSpecModuleScope {
  return binder.createScope<TypeSpecModuleScope>({
    kind: "module",
    name: path,
    parent,
    importedModules: new Set(),
    addImport(this: TypeSpecModuleScope, targetModule) {
      this.importedModules.add(targetModule);
    },
    usings: new Set(),
    addUsing(this: TypeSpecModuleScope, using) {
      this.usings.add(using);
    },
    setFileNamespace(namespace) {
      // TODO: Checks, and maybe reshuffling
      this.fileNamespace = namespace;
    },
  });
}
