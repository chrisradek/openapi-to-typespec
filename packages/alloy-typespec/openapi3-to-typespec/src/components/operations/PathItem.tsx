/*
  What does it need to do?
  1. It has a `path` (e.g. `/`)
  2. It may have extensions and parameters common to the path's defined HTTP methods

---

I need to generate all of the operations - and they require parameters, requestBodies, and responseContent.

// OK, so the #/components/pathItems is a map to `PathItems` without the actual `path` being specified.

So I could have something like this:

```json
{
  paths: {
    "/": { $ref: "#/components/pathItems/Foo" }
  }
}
```

__Thought__: Could turn `#/components/pathItems` into interfaces if they are referenced.
This would only impact the operationId, which we could fix with a decorator.

So let's collect operations...


*/
import * as ay from "@alloy-js/core";
import { OpenApiContext, useOpenApi } from "../../context/openapi.js";
import {
  OpenAPI3Operation,
  OpenAPI3Parameter,
  Refable,
} from "../../openapi-types.js";

function Operations() {
  const { document, resolveReference } = useOpenApi();

  const paths = document.paths;

  const operations = ay.computed(() => {
    const operations: OpenAPI3Operation[] = [];

    // Iterate through all the paths
    for (const [path, pathItem] of Object.entries(paths)) {
      if ("$ref" in pathItem) {
        // TODO: resolve pathItem from `#/components/pathItems` and ignore the rest.
        // The behavior is undefined if both `$ref` and sibling fields are present,
        // so probably should log a warning and pick a strategy.
        // The spec implies that in future revisions `$ref` should be chosen, and sibling fields ignored.
        continue;
      }
      // Collection parameters/extensions/servers
      const commonParameters = pathItem.parameters ?? [];
      const keys = Object.keys(pathItem);
      // collect extensions
      const commonExtensions = keys
        .filter((k) => k.startsWith("x-"))
        .map((k) => {
          return { [k]: pathItem[k as `x-${string}`] };
        });

      // Check if there's a `$ref` - the behavior is undefined if both `$ref` and
      // sibling fields are present, so probably should log a warning and pick a strategy.
      // The spec implies that in future revisions `$ref` should be chosen, and sibling fields ignored.

      // Iterate through all the methods
      for (const [method, value] of Object.entries(pathItem)) {
        if (!["get", "put", "post", "delete", "head", "patch"].includes(method))
          continue;
        const httpOperation = value as OpenAPI3Operation;
        // Things that could be $refs
        // [parameters[index], requestBody, responses[status]]

        // Collect more parameters
        const parameters = [...commonParameters];
        for (const p of httpOperation.parameters) {
          upsertMatchingParameter(resolveReference, parameters, p);
        }
      }
    }

    return operations;
  });
}

function upsertMatchingParameter(
  resolveReference: OpenApiContext["resolveReference"],
  parameterList: Refable<OpenAPI3Parameter>[],
  parameter: Refable<OpenAPI3Parameter>,
): void {
  // parameters are uniquely identified by a combination of their `name` and `in` (location).
  // if a parameter is a $ref, we need to resolve the ref first to get the `name`/`in` fields.
  const newParameterKey = getParameterIdentifier(resolveReference, parameter);

  for (let i = 0; i < parameterList.length; i++) {
    if (
      getParameterIdentifier(resolveReference, parameterList[i]) ===
      newParameterKey
    ) {
      // Found a matching parameter - replace it
      parameterList.splice(i, 1, parameter);
      return;
    }
  }

  parameterList.push(parameter);
}

function getParameterIdentifier(
  resolveReference: OpenApiContext["resolveReference"],
  parameter: Refable<OpenAPI3Parameter>,
): string {
  if ("$ref" in parameter) {
    const ref = resolveReference<OpenAPI3Parameter>(parameter.$ref);
    if (!ref) {
      throw new Error(`Unable to resolve parameter at ${parameter.$ref}`);
    }
    return `${ref.name}-${ref.in}`;
  } else {
    return `${parameter.name}-${parameter.in}`;
  }
}
