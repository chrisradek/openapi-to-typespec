import {
  Children,
  createContext,
  Scope,
  SourceDirectory,
  SourceDirectoryContext,
  useBinder,
  useContext,
  useScope,
} from "@alloy-js/core";
import {
  createTypeSpecPackageScope,
  TypeSpecPackageScope,
} from "../symbols/typespec-package-scope.js";
import { PackageJson, PackageJsonProps } from "./PackageJson.jsx";
import { join } from "path";
import { TSPConfigProps } from "./TSPConfig.jsx";

export interface PackageContext {
  scope: TypeSpecPackageScope;
}

export const PackageContext = createContext<PackageContext>();

export function usePackage() {
  return useContext(PackageContext);
}

export interface PackageDirectoryProps extends PackageJsonProps {
  path?: string;
  children?: Children;
  tspConfig?: TSPConfigProps;
}

export function PackageDirectory(props: PackageDirectoryProps) {
  const packageContext = createPackageContext(
    props.name,
    props.version,
    props.path ?? ".",
  );

  return <SourceDirectory path={props.path ?? "."}>
    <PackageContext.Provider value={packageContext}>
      <Scope value={packageContext.scope}>
        <PackageJson name={props.name} version={props.version} />
        {props.children}
      </Scope>
    </PackageContext.Provider>
  </SourceDirectory>;
}

function createPackageContext(
  name: string,
  version: string,
  path: string,
): PackageContext {
  const parentDir = useContext(SourceDirectoryContext);
  const fullPath = parentDir ? join(parentDir.path, path) : path;

  const scope = createTypeSpecPackageScope(
    useBinder(),
    useScope(),
    name,
    version,
    fullPath,
  );

  return {
    scope,
  };
}
