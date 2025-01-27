import { memo, SourceFile } from "@alloy-js/core";
import { usePackage } from "./PackageDirectory.jsx";
import { modulePath } from "../utils.js";

export interface PackageJsonProps {
  name: string;
  version: string;
  private?: boolean;
}

type ExportConditions = {
  [condition: string]: string;
};

interface PackageExports {
  [path: string]: ExportConditions;
}

export function PackageJson(props: PackageJsonProps) {
  const pkg = usePackage();
  if (!pkg) {
    throw new Error(
      "PackageJson component needs to be inside a PackageDirectory",
    );
  }

  const jsonContent = memo(() => {
    const peerDependencies = Object.fromEntries(
      Array.from(pkg.scope.peerDependencies).map((d) => [
        d.name,
        `^${d.version}`,
      ]),
    );

    const pkgJson: Record<string, any> = {
      name: props.name,
      version: props.version,
      type: "module",
      dependencies: {}, // TODO: get from package scope
      peerDependencies: {
        "@typespec/compiler": "latest",
        ...peerDependencies,
      },
      devDependencies: {
        "@typespec/compiler": "latest",
        ...peerDependencies,
      },
    };

    const exportsEntries: [string, ExportConditions][] = [];
    for (const [publicPath, module] of pkg.scope.exportedSymbols) {
      exportsEntries.push([publicPath, { typespec: modulePath(module.name) }]);
    }
    if (exportsEntries.length) {
      pkgJson.exports = Object.fromEntries(exportsEntries);
    }

    if (props.private) {
      pkgJson.private = true;
    }

    return JSON.stringify(pkgJson, null, 2);
  });

  return <SourceFile path="package.json" filetype="json">
    {jsonContent}
  </SourceFile>;
}
