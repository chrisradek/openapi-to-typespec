import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { OpenAPISchema3_1 } from "../../openapi-types.js";
import { SchemaExpression } from "./SchemaExpression.jsx";
import { openapi3Lib } from "../../packages/openapi.js";

export interface UnionDeclarationProps extends tsp.UnionDeclarationProps {
  schema: OpenAPISchema3_1;
}

export function UnionDeclaration({
  schema,
  refkey,
  ...props
}: UnionDeclarationProps) {
  const declRefkey = refkey ?? ay.refkey(schema);

  const variants = ay.computed(() => {
    // OpenAPI 3 schemas don't really support named union variants,
    // though there is a proposal to use `const` and `title` to make it work.
    // Should consider making this an option (and maybe update the emitter as well),
    // though unsure how well tools support this.

    const variants: ay.Children[] = [];

    if (schema.enum) {
      for (const e of schema.enum) {
        // TODO: docs/decoration
        variants.push(<tsp.ValueExpression value={e} />);
      }
    } else if (schema.anyOf || schema.oneOf) {
      const subSchemas = schema.oneOf ?? schema.anyOf;
      for (const sub of subSchemas!) {
        // TODO: docs/decoration
        variants.push(<SchemaExpression schema={sub} />);
      }
    } else if (schema.type) {
      // Should already be an array but let's be safe
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];
      for (const type of types) {
        // TODO: docs/decoration
        variants.push(<SchemaExpression schema={{...schema, type}} />);
      }
    }
    return variants;
  });

  const decorators: ay.Children[] = [];
  if (schema.oneOf) {
    decorators.push(
      <tsp.DecoratorExpression refkey={openapi3Lib.OpenAPI["@oneOf"]} />,
    );
  }
  const decoratorOutput = ay.join(decorators, { joiner: "\n", ender: "\n" });

  return <>
    {decoratorOutput}<tsp.UnionDeclaration {...props} refkey={declRefkey}>
      {ay.join(variants.value, { joiner: ",\n", ender: ","})}
    </tsp.UnionDeclaration>
  </>;
}
