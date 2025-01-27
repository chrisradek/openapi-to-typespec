import * as ay from "@alloy-js/core";
import * as tsp from "alloy-typespec";
import { httpLib } from "../packages/http.js";
import { openapiLib } from "../packages/openapi.js";

export const helperRefkeys = {
  Response: ay.refkey(),
  DefaultResponse: ay.refkey(),
};

export function Helpers() {
  const templatedDoc =
    <tsp.DecoratorExpression name="doc">
      <tsp.ValueExpression value={"${Description}"}/>
    </tsp.DecoratorExpression>;
  // TODO: Create helper for Error (statusCodes 400 - 599)
  return <tsp.Namespace name={"_TSP"}>
    <ay.Declaration name="Response" refkey={helperRefkeys.Response}>
      /**
       * Template model that supports overriding the description for Open API response objects.
       * @template Description The description that should be emitted.
       * @template Properties The properties on the response.
       */
      {templatedDoc}
      model <ay.Name />{"<"}Description extends valueof string, Properties extends {"{}"} = {"{}"}{">"}<tsp.Block>
        ...Properties;
      </tsp.Block>
    </ay.Declaration>

    <ay.Declaration name="DefaultResponse" refkey={helperRefkeys.DefaultResponse}>
      /**
       * Template model that supports overriding the description for Open API response objects.
       * Note: This template should be used instead of `Response` when emitting `default` status code.
       * @template Description The description that should be emitted.
       * @template Properties The properties on the response - excluding statusCode.
       */
      {templatedDoc}
      <tsp.DecoratorExpression refkey={openapiLib.OpenAPI["@defaultResponse"]} />
      model <ay.Name />{"<"}Description extends valueof string, Properties extends {"{}"} = {"{}"}{">"}<tsp.Block>
        // Specifying status code to make sure emitted description is overridden.
        <tsp.DecoratorExpression name="minValue">
          <tsp.ValueExpression value={100} />
        </tsp.DecoratorExpression>
        <tsp.DecoratorExpression name="maxValue">
          <tsp.ValueExpression value={599} />
        </tsp.DecoratorExpression>
        <tsp.DecoratorExpression refkey={httpLib.Http["@statusCode"]} /> `.`: <tsp.TypeExpression builtin="int8" />;
        ...Properties;
      </tsp.Block>
    </ay.Declaration>
  </tsp.Namespace>;
}
