import baselvl from "../schema/index.json";
import metadataSchema from "../schema/metadata.json";
import specSchema from "../schema/spec.json";
const lvl1 = ["apiVersion", "kind", "metadata", "spec"];

const METADATA_SCHEMA: any = metadataSchema;
const SPEC_SCHEMA: any = specSchema;

export const getBasePolicy = (ctx: any) => {
  const identifiers: Array<string> = ctx.customRules.map(
    ({ identifier }: { identifier: string }) => identifier
  );
  return {
    apiVersion: "v1",
    policies: [
      {
        name: "autogen-pass-sample1",
        isDefault: true,
        rules: identifiers.map((v) => ({
          identifier: v,
          messageOnFailure: "",
        })),
      },
    ],
  };
};

export function parser(doc: any) {
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
  return { ...getBasePolicy(policy), ...policy };
}

// ctx = [{ key, values }, { key, values }, {}]
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
