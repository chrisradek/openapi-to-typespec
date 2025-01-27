import {
  SourceFile as CoreSourceFile,
  Children,
  createContext,
  Scope,
  SourceDirectoryContext,
  useBinder,
  useContext,
  useScope,
} from "@alloy-js/core";
import {
  createTypeSpecModuleScope,
  TypeSpecModuleScope,
} from "../symbols/typespec-module-scope.js";
import { Reference } from "./Reference.jsx";
import { ImportStatements } from "./ImportStatement.jsx";
import { join } from "path";
import { PackageContext, usePackage } from "./PackageDirectory.jsx";

export interface SourceFileContext {
  scope: TypeSpecModuleScope;
}

export const SourceFileContext = createContext<SourceFileContext>();

export function useSourceFile() {
  return useContext(SourceFileContext)!;
}

export interface SourceFileProps {
  path: string;
  children?: Children;
  export?: boolean | string;
  /**
   * Whether to automatically add `using` statements for imports
   */
  usings?: boolean;
}

export function SourceFile(props: SourceFileProps) {
  const directoryContext = useContext(SourceDirectoryContext);
  const currentDir = directoryContext?.path;
  const pathParts: string[] = [props.path];
  if (currentDir) pathParts.unshift(currentDir);
  const fullPath = join(...pathParts);
  const scope = createTypeSpecModuleScope(useBinder(), useScope(), fullPath);
  const pkg = usePackage();

  const sourceFileCtx: SourceFileContext = { scope };

  if (props.export && pkg) {
    if (typeof props.export === "boolean") {
      pkg.scope.addExport(props.path, scope);
    } else {
      pkg.scope.addExport(props.export, scope);
    }
  }

  return <CoreSourceFile path={props.path} filetype="typespec" reference={Reference}>
    {scope.importedModules.size > 0 && 
      (<><ImportStatements records={scope.importedModules} />{"\n"}</>)
    }<SourceFileContext.Provider value={sourceFileCtx}>
      <Scope value={scope}>
        {props.children}
      </Scope>
    </SourceFileContext.Provider>
  </CoreSourceFile>;
}
