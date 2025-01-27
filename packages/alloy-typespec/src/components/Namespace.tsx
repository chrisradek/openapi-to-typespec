import { Children, code, Scope, useBinder, useScope } from "@alloy-js/core";
import { Block } from "./Block.jsx";
import { createTypeSpecNamespaceScope } from "../symbols/scopes.js";
import { NameSpaceContext, NamespaceContext } from "../context/namespace.js";
import { useSourceFile } from "./SourceFile.jsx";

export interface NamespaceProps {
  name: string;
  fileLevel?: boolean;
  children?: Children;
}

export function Namespace({ name, fileLevel: file, ...props }: NamespaceProps) {
  const scope = createTypeSpecNamespaceScope(useBinder(), useScope(), name);

  const namespaceCtx: NamespaceContext = {
    name,
  };

  let children: Children;
  if (file) {
    const sourceFile = useSourceFile();

    if (sourceFile.scope.fileNamespace) {
      throw new Error(
        "Cannot have multiple file-level namespaces in a single file.",
      );
    }

    sourceFile.scope.setFileNamespace(scope);
    children = props.children;
  } else {
    children = <Block>{props.children}</Block>;
  }

  return <NameSpaceContext.Provider value={namespaceCtx}>
    <Scope value={scope}>
      namespace {namespaceCtx.name}{file ? code`;\n${children}` : code`${" "}${children}`}
    </Scope>
  </NameSpaceContext.Provider>;
}
