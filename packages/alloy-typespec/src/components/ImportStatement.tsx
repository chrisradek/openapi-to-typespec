import { memo, SourceDirectoryContext, useContext } from "@alloy-js/core";
import { TypeSpecModuleScope } from "../symbols/typespec-module-scope.js";
import { relative } from "node:path";
import { TypeSpecPackageScope } from "../symbols/typespec-package-scope.js";
import { modulePath } from "../utils.js";

export interface ImportStatementsProps {
  records: Set<TypeSpecModuleScope>;
}

export function ImportStatements(props: ImportStatementsProps) {
  return memo(() => {
    return Array.from(props.records.values())
      .map((module) => {
        // TODO: Eventually I'll need to expand this check when I support
        // internal packages.
        if (module.parent?.kind === "package") {
          // importing from another package!
          const targetPackage = module.parent as TypeSpecPackageScope;

          let foundPath: string | false = false;
          for (const [
            publicPath,
            exportedModule,
          ] of targetPackage.exportedSymbols) {
            // TODO: decide what to do if a module is exported from multiple paths
            if (exportedModule === module) {
              foundPath = publicPath;
            }
          }
          if (!foundPath) {
            throw new Error("Module not exported from package");
          }

          const packageName = targetPackage.name + foundPath.slice(1);

          return `import "${packageName}";`;
        }

        const currentDir = useContext(SourceDirectoryContext)!.path;
        const targetPath = modulePath(relative(currentDir, module.name));

        return `import "${targetPath}";`;
      })
      .join("\n");
  });
}
