import baselvl from "../schema/index.json";
import metadataSchema from "../schema/metadata.json";
import specSchema from "../schema/spec.json";
const lvl1 = ["apiVersion", "kind", "metadata", "spec"];

const METADATA_SCHEMA: any = metadataSchema;
const SPEC_SCHEMA: any = specSchema;

/**
 * Builds the base Datree policy for custom rules publishing.
 * Can be extended manually as required.
 *
 * @param ctx Yaml.Node
 * @param filename string
 * @returns BasePolicy
 */
export const getBasePolicy = (ctx: any, filename: string) => {
  const identifiers: Array<string> = ctx.customRules.map(
    ({ identifier }: { identifier: string }) => identifier
  );
  return {
    apiVersion: "v1",
    policies: [
      {
        name: `autogen_pass_${filename}`,
        isDefault: true,
        rules: identifiers.map((v) => ({
          identifier: v,
          messageOnFailure: "",
        })),
      },
    ],
  };
};

/**
 * Parse the given k8 yml configuration to generate Datree Policy
 * **Features**
 *   - Parsing YAML config properties
 *   - Support for Resource Limits. Ex: maximum: 25
 *   - Supports enums, string and limit values
 *
 * Schemas Used - index.json, metadata.json, spec.json
 *
 * @param doc Yaml.Node
 * @param filename string
 * @returns YamlJSON
 */
export function parser(doc: any, filename: string) {
  const policy: any = { customRules: [] };
  // First lvl parse
  const lvl1Props = baselvl.properties;
  for (const lvl1 in doc) {
    if (Object.keys(lvl1Props).includes(lvl1)) {
      switch (lvl1) {
        case "apiVersion": {
          const rule = {
            identifier: `${lvl1.toUpperCase()}_CHECK`,
            defaultMessageOnFailure: `Failed ${lvl1.toUpperCase()}_CHECK`,
            schema: buildSchema({ key: lvl1, values: [doc[lvl1]] }, []),
          };
          policy.customRules.push(rule);
          break;
        }
        case "kind": {
          const rule = {
            identifier: `${lvl1.toUpperCase()}_CHECK`,
            defaultMessageOnFailure: `Failed ${lvl1.toUpperCase()}_CHECK`,
            schema: buildSchema({ key: lvl1, values: [doc[lvl1]] }, []),
          };
          policy.customRules.push(rule);
          break;
        }
        case "metadata": {
          const keywords = Object.keys(metadataSchema).flatMap((key) => {
            if (METADATA_SCHEMA[key].properties) {
              const cache = [];
              for (const propKey of Object.keys(
                METADATA_SCHEMA[key].properties
              )) {
                cache.push({
                  key: propKey,
                  description:
                    METADATA_SCHEMA[key].properties[propKey].description ||
                    null,
                  type: METADATA_SCHEMA[key].properties[propKey].type || null,
                });
              }
              return cache;
            }
          });
          const metadataProperties = doc[lvl1];
          const builder = [];
          for (const prop in metadataProperties) {
            for (const keyword of keywords.values()) {
              if (keyword?.key === prop) {
                // v2: Can be extended to support for `objects` by just calling this function again
                if (keyword?.type === "string" || keyword?.type === "integer") {
                  builder.push({
                    schemaConfig: {
                      parents: [lvl1],
                      key: prop,
                      values:
                        typeof metadataProperties[prop] === "string"
                          ? [metadataProperties[prop]]
                          : metadataProperties[prop],
                    },
                    identifier: `${lvl1.toUpperCase()}_${prop.toUpperCase()}_CHECK`,
                    defaultMessageOnFailure: `Failed ${lvl1.toUpperCase()}_${prop.toUpperCase()}_CHECK\n${
                      keyword.description &&
                      `Description: ${keyword.description}`
                    }`,
                  });
                }
                if (keyword.type)
                  // Note: Keeping only the first type of 'property' inside datree policy rules
                  break;
              }
            }
          }
          for (const buildCtx of builder) {
            const rule = {
              identifier: buildCtx.identifier,
              defaultMessageOnFailure: buildCtx.defaultMessageOnFailure,
              schema: buildSchema(buildCtx.schemaConfig, [lvl1]),
            };
            policy.customRules.push(rule);
          }
          break;
        }
        case "spec": {
          const keywords = Object.keys(specSchema).flatMap((key) => {
            if (SPEC_SCHEMA[key].properties) {
              const cache = [];
              for (const propKey of Object.keys(SPEC_SCHEMA[key].properties)) {
                cache.push({
                  key: propKey,
                  description:
                    SPEC_SCHEMA[key].properties[propKey].description || null,
                  type: SPEC_SCHEMA[key].properties[propKey].type || null,
                });
              }
              return cache;
            }
          });
          const specProperties = doc[lvl1];
          const builder = [];
          for (const prop in specProperties) {
            for (const keyword of keywords.values()) {
              if (keyword?.key === prop) {
                if (keyword?.type === "string" || keyword?.type === "integer") {
                  builder.push({
                    schemaConfig: {
                      parents: [lvl1],
                      key: prop,
                      values: Array.isArray(specProperties[prop])
                        ? specProperties[prop]
                        : [specProperties[prop]],
                    },
                    identifier: `${lvl1.toUpperCase()}_${prop.toUpperCase()}_CHECK`,
                    defaultMessageOnFailure: `Failed ${lvl1.toUpperCase()}_${prop.toUpperCase()}_CHECK\n${
                      keyword.description &&
                      `Description: ${keyword.description}`
                    }`,
                  });
                }
                if (keyword.type)
                  // Keeping only the first type of 'property' inside datree policy rules
                  break;
              }
            }
          }
          for (const buildCtx of builder) {
            const rule = {
              identifier: buildCtx.identifier,
              defaultMessageOnFailure: buildCtx.defaultMessageOnFailure,
              schema: buildSchema(buildCtx.schemaConfig, [lvl1]),
            };
            policy.customRules.push(rule);
          }
          break;
        }
        default:
          break;
      }
    }
  }
  return { ...getBasePolicy(policy, filename), ...policy };
}

/**
 * Recursive Generative Algorithm to build nested properties
 * Also supports value ranges like maximum and minimum in datree policy
 *
 * @param ctxUpper { key: string, values: Array<string> }
 * @param parents Array<string>
 * @returns Datree Schema
 */
export function buildSchema(
  ctxUpper: { key: string; values: Array<string> },
  parents: Array<string>
) {
  const buildParentProperties = (
    parents: Array<string>,
    build: any,
    ctx: any
  ) => {
    if (parents.length <= 0) {
      if (ctx[ctxUpper.key].enumOrRange.length === 1) {
        if (!isNaN(ctx[ctxUpper.key].enumOrRange[0])) {
          return {
            properties: {
              [ctxUpper.key]: {
                maximum: ctxUpper.values[0],
              },
            },
          };
        }
      }
      return {
        properties: {
          [ctxUpper.key]: {
            enum: ctxUpper.values,
          },
        },
      };
    }
    for (const parent of parents) {
      build.properties = {
        [parent]: buildParentProperties(
          parents.slice(1),
          build.properties,
          ctx
        ),
      };
    }
    return build;
  };
  let build: any = {};
  build = buildParentProperties(parents, build, {
    [ctxUpper.key]: { enumOrRange: [...ctxUpper.values] },
  });
  return build;
}
