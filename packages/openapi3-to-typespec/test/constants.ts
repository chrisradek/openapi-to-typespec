// Indentation does matter here.
export const GeneratedHelpers = `namespace _TSP {
        /**
          * Template model that supports overriding the description for Open API response objects.
          * @template Description The description that should be emitted.
          * @template Properties The properties on the response.
          */
        @doc("\${Description}")
        model Response<Description extends valueof string, Properties extends {} = {}>{
          ...Properties;
        }
        
        /**
          * Template model that supports overriding the description for Open API response objects.
          * Note: This template should be used instead of \`Response\` when emitting \`default\` status code.
          * @template Description The description that should be emitted.
          * @template Properties The properties on the response - excluding statusCode.
          */
        @doc("\${Description}")
        @OpenAPI.defaultResponse
        model DefaultResponse<Description extends valueof string, Properties extends {} = {}>{
          // Specifying status code to make sure emitted description is overridden.
          @minValue(100)
          @maxValue(599)
          @Http.statusCode \`.\`: int8;
          ...Properties;
        }
      }`;
