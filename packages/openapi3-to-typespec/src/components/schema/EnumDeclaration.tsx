import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPISchema3_1 } from "../../openapi-types.js";

export interface EnumDeclarationProps extends tsp.EnumDeclarationProps {
  schema: OpenAPISchema3_1;
}

export function EnumDeclaration({refkey, schema, ...props}: EnumDeclarationProps) {
  const declRefkey = refkey ?? ay.refkey(schema);
  const enums = schema.enum as Array<number | string>;
  // TODO: Decorators? Are there any for enums?

  return <tsp.EnumDeclaration {...props} refkey={declRefkey}>
    {ay.mapJoin(enums, (e) => {
      return <tsp.EnumMember name={e.toString()} value={e} />
    }, {joiner: "\n"})}
  </tsp.EnumDeclaration>;
}