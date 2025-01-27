import {
  Binder,
  getSymbolCreatorSymbol,
  refkey,
  Refkey,
  SymbolCreator,
} from "@alloy-js/core";
import { createTypeSpecPackageScope } from "./symbols/typespec-package-scope.js";
import { createTypeSpecModuleScope } from "./symbols/typespec-module-scope.js";
import {
  createTypeSpecNamespaceScope,
  TypeSpecNamespaceScope,
} from "./symbols/scopes.js";
import { createTypeSpecSymbol } from "./symbols/typespec-output-symbol.js";

export interface PackageDescriptor {
  [path: string]: {
    [namespaces: string]: readonly string[];
  };
}

export interface CreatePackageProps<T extends PackageDescriptor> {
  name: string;
  version: string;
  descriptor: T;
}

export type PackageRefKeys<T extends PackageDescriptor> = {
  [Path in keyof T as Path extends "." ? never : Path]: {
    [Namespace in keyof T[Path]]: { [S in T[Path][Namespace][number]]: Refkey };
  };
} & (T["."] extends { [namespace: string]: readonly string[] } ?
  {
    [Namespace in keyof T["."]]: { [S in T["."][Namespace][number]]: Refkey };
  }
: {});

export function createPackage<const T extends PackageDescriptor>(
  props: CreatePackageProps<T>,
): PackageRefKeys<T> & SymbolCreator {
  const refkeys: any = {
    [getSymbolCreatorSymbol()](binder: Binder) {
      createSymbols(binder, props, refkeys);
    },
  };

  for (const [path, namespaces] of Object.entries(props.descriptor)) {
    const isRootPath = path === ".";
    const pathKeys =
      isRootPath ? refkeys : ((refkeys[path] = {}), refkeys[path]);

    // each namespace should be applied
    for (const [namespace, symbols] of Object.entries(namespaces)) {
      const namespaceKeys = ((pathKeys[namespace] = {}), pathKeys[namespace]);

      for (const s of symbols ?? []) {
        namespaceKeys[s] = refkey(props.descriptor, path, namespace, s);
      }
    }
  }

  return refkeys;
}

function createSymbols(
  binder: Binder,
  props: CreatePackageProps<PackageDescriptor>,
  refkeys: Record<string, any>,
) {
  const packageScope = createTypeSpecPackageScope(
    binder,
    undefined,
    props.name,
    props.version,
    `node_modules/${props.name}`,
  );

  // Need to create symbols for everything...
  for (const [path, namespaces] of Object.entries(props.descriptor)) {
    const isRootPath = path === ".";
    const pathKeys = isRootPath ? refkeys : refkeys[path];

    // Do I need to create a module scope here?
    const moduleScope = createTypeSpecModuleScope(binder, packageScope, path);
    packageScope.addExport(path, moduleScope);

    // each namespace should be applied
    for (const [namespace, symbols] of Object.entries(namespaces)) {
      const namespaceKeys = pathKeys[namespace];

      // Create a namespace scope?
      if (namespace === "") {
        // TODO: special case - add to global scope
        continue;
      }

      let namespaceScope: TypeSpecNamespaceScope | undefined;
      const namespacePath = namespace.split(".");
      while (namespacePath.length) {
        const ns = namespacePath.shift()!;
        namespaceScope = createTypeSpecNamespaceScope(
          binder,
          namespaceScope ? namespaceScope : moduleScope,
          ns,
        );
      }

      // Now need to add symbols to the namespace...
      for (const s of symbols ?? []) {
        const name = s.startsWith("@") ? s.substring(1) : s;
        const sym = createTypeSpecSymbol({
          name,
          refkey: namespaceKeys[s],
          scope: namespaceScope,
        });
      }
    }
  }
}
