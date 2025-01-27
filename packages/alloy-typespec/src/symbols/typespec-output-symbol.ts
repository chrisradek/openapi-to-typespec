import {
  DeclarationProps,
  OutputSymbol,
  OutputSymbolFlags,
  Refkey,
  refkey,
  useDefaultScope,
  useScope,
} from "@alloy-js/core";
import { TypeSpecOutputScope } from "./scopes.js";

export interface TypeSpecOutputSymbol extends OutputSymbol {
  scope: TypeSpecOutputScope;
}

export interface CreateTypeSpecSymbolProps {
  name: string;
  refkey?: Refkey;
  scope?: TypeSpecOutputScope;
  flags?: OutputSymbolFlags;
}

export function createTypeSpecSymbol(props: CreateTypeSpecSymbolProps) {
  const scope =
    props.scope ?? (useDefaultScope(props.flags) as TypeSpecOutputScope);

  const sym = scope.binder.createSymbol<TypeSpecOutputSymbol>({
    name: props.name!,
    scope,
    refkey: props.refkey ?? refkey(props.name!),
    flags: props.flags ?? OutputSymbolFlags.None,
  });

  return sym;
}
