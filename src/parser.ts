import { basePolicy } from ".";
import baselvl from "../schema/index.json";
const lvl1 = ["apiVersion", "kind", "metadata", "spec"];
const k8 = {};
// Any children property below can be passed enum values
const enumifyMetadata = ["labels", "annotations"];

export function parser(doc: any) {
  const policy: any = { ...basePolicy };
  // First lvl parse
  const lvl1Props = baselvl.properties;
  for (const lvl1 in doc) {
    if (Object.keys(lvl1Props).includes(lvl1)) {
      switch (lvl1) {
        case "apiVersion": {
          const rule = {
            identifier: `${lvl1.toUpperCase()}_CHECK`,
            messageOnFailure: `Failed ${lvl1.toUpperCase()}_CHECK`,
            schema: buildSchema([{ key: lvl1, values: [doc[lvl1]] }]),
          };
          policy.customRules.push(rule);
          break;
        }
        case "kind": {
          const rule = {
            identifier: `${lvl1.toUpperCase()}_CHECK`,
            messageOnFailure: `Failed ${lvl1.toUpperCase()}_CHECK`,
            schema: buildSchema([{ key: lvl1, values: [doc[lvl1]] }]),
          };
          policy.customRules.push(rule);
          break;
        }
        default:
          break;
      }
    }
  }
  return policy;
}

// ctx = [{ key, values }, { key, values }, {}]
export function buildSchema(
  ctx: Array<{ key: string; values: Array<string> }>
) {
  let build: any = {};
  let currPtr = build;
  for (const [index, atomicCtx] of ctx.entries()) {
    currPtr.properties = {
      [atomicCtx.key]: {},
    };
    if (index === ctx.length - 1) {
      currPtr.properties[atomicCtx.key].enum = [...atomicCtx.values];
    }
    build = currPtr;
  }
  return build;
}
