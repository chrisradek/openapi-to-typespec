import { OpenAPISchema3_1, Refable } from "../../openapi-types.js";
import { AliasDeclaration } from "./AliasDeclaration.jsx";
import { ArrayDeclaration } from "./ArrayDeclaration.jsx";
import { EnumDeclaration } from "./EnumDeclaration.jsx";
import { ModelDeclaration } from "./ModelDeclaration.jsx";
import { ScalarDeclaration } from "./ScalarDeclaration.jsx";
import { UnionDeclaration } from "./UnionDeclaration.jsx";
import { getTspKind, TspDeclarationKinds } from "./utils.js";

export interface SchemaDeclarationProps {
  name: string;
  schema: Refable<OpenAPISchema3_1>;
}

export function SchemaDeclaration(props: SchemaDeclarationProps) {
  const tspKind: TspDeclarationKinds = getTspKind(props.schema);
  // Keep TypeScript happy - $ref will always go to `alias`.
  const schema = props.schema as OpenAPISchema3_1;
  switch (tspKind) {
    case "alias":
      return <AliasDeclaration name={props.name} schema={schema} />;
    case "array":
      return <ArrayDeclaration name={props.name} schema={schema} />;
    case "enum":
      return <EnumDeclaration name={props.name} schema={schema} />;
    case "model":
      return <ModelDeclaration name={props.name} schema={schema} />;
    case "union":
      return <UnionDeclaration name={props.name} schema={schema} />;
    case "scalar":
      return <ScalarDeclaration name={props.name} schema={schema} />;
  }
}