import yaml from "js-yaml";
import { buildYaml } from "./utils";
import fs from "fs";
import { parser } from "./parser";

try {
  const doc = yaml.load(
    fs.readFileSync(__dirname + "/../k8/sample1.yml", "utf8")
  );
  // console.log(doc);
  // fs.writeFileSync(
  //   __dirname + "/../output/sample1.dump.json",
  //   JSON.stringify(doc)
  // );
  const parsedPolicyCtx = parser(doc);
  buildYaml({ ...parsedPolicyCtx }, "sample1-policy-gen.yml");
} catch (e) {
  console.log(e);
}
