import { memo, Refkey, resolve, useBinder, useContext } from "@alloy-js/core";
import { SourceFileContext } from "../components/SourceFile.jsx";
import { TypeSpecOutputScope } from "./scopes.js";
import { TypeSpecOutputSymbol } from "./typespec-output-symbol.js";
import { TypeSpecModuleScope } from "./typespec-module-scope.js";
import { usePackage } from "../components/PackageDirectory.jsx";
import { TypeSpecPackageScope } from "./typespec-package-scope.js";

function getTargetLocation(
  kind?: TypeSpecOutputScope["kind"],
): "package" | "module" | "namespace" | "local" {
  if (kind && ["package", "module", "namespace"].includes(kind)) {
    return kind as "package" | "module" | "namespace";
  }
  if (kind) {
    // Won't include 'global' or any memberPaths, so this would be unexpected.
    // Maybe `interface`?
    console.warn(`Unexpected kind for getting targetLocation: ${kind}`);
  }
  return "local";
}

export function ref(refkey: Refkey): () => string {
  const sourceFile = useContext(SourceFileContext);
  const resolveResult = resolve<TypeSpecOutputScope, TypeSpecOutputSymbol>(
    refkey,
  );

  return memo(() => {
    if (resolveResult.value === undefined) {
      return `<Unresolved Symbol>`;
    }

    const { targetDeclaration, pathDown, pathUp, commonScope, memberPath } =
      resolveResult.value;

    // Where the target declaration is relative to the referencing scope.
    // * package: target symbol is in a different package
    // * module: target symbol is in a different module
    // * namespace: target symbol is in a different namespace within the current module
    // * local: target symbol is within the current module
    const targetLocation = getTargetLocation(pathDown[0]?.kind);
    console.log(
      `kind: ${pathDown[0]?.kind}, targetLocation: ${targetLocation}`,
    );
    let localSymbol: TypeSpecOutputSymbol | undefined;

    if (targetLocation === "package") {
      // The reference target is in a different package - we'll need to import and update our
      // package's dependencies (if we are generating a package)
      // Attempt to add the package to our package's dependencies if we're generating a package.
      const pkg = usePackage();
      const sourcePackage = pathDown[0] as TypeSpecPackageScope;

      if (pkg) {
        // For now we're adding libs as peer dependencies - can revisit whether this makes sense.
        pkg.scope.addPeerDependency(sourcePackage);
      }

      // TODO: add `usings` entry for sourceFile by going down the `pathDown`

      // Add the import to the sourceFile
      sourceFile?.scope.addImport(pathDown[1] as TypeSpecModuleScope);
    } else if (targetLocation === "module") {
      // The reference target is in the same package, but a different module (file).
      // We'll need to import the module.
      const sourceModule = pathDown[0] as TypeSpecModuleScope;
      sourceFile?.scope.addImport(sourceModule);
    }

    const path = pathDown
      .filter((item) => !["package", "module"].includes(item.kind))
      .map((item) => item.name);
    if (memberPath && memberPath.length > 0) {
      path.push(...memberPath.map((sym) => sym.name));
      return path.join(".");
    } else {
      path.push(targetDeclaration.name);
      return path.join(".");
    }
  });
}
