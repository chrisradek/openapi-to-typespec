import { Binder, OutputScope } from "@alloy-js/core";
import { TypeSpecModuleScope } from "./typespec-module-scope.js";
import { modulePath, removeFileExtension } from "../utils.js";

export interface TypeSpecPackageScope extends OutputScope {
  kind: "package";

  version: string;

  path: string;
  /**
   * Mapping of exported submodule paths to internal module path.
   */
  exportedSymbols: Map<string, TypeSpecModuleScope>;
  dependencies: Set<TypeSpecPackageScope>;
  peerDependencies: Set<TypeSpecPackageScope>;

  addExport(publicPath: string, localModule: TypeSpecModuleScope): void;
  addPeerDependency(pkg: TypeSpecPackageScope): void;
}

export function createTypeSpecPackageScope(
  binder: Binder,
  parent: OutputScope | undefined,
  name: string,
  version: string,
  path: string,
) {
  return binder.createScope<TypeSpecPackageScope>({
    kind: "package",
    name,
    parent,
    version,
    path,
    exportedSymbols: new Map(),
    dependencies: new Set(),
    peerDependencies: new Set(),
    addExport(publicPath, localModule) {
      // remove extension from package paths
      let path = removeFileExtension(modulePath(publicPath));
      this.exportedSymbols.set(path, localModule);
    },
    addPeerDependency(pkg) {
      this.peerDependencies.add(pkg);
    },
  });
}
