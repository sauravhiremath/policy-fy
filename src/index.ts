import yaml from "js-yaml";
import { buildYaml } from "./utils";
import fs from "fs";
import { parser } from "./parser";

function main(args: string[]) {
  try {
    const doc = yaml.load(
      fs.readFileSync(__dirname + "/../k8/sample4.yml", "utf8")
    );
    // console.log(doc);
    // fs.writeFileSync(
    //   __dirname + "/../output/sample1.dump.json",
    //   JSON.stringify(doc)
    // );
    const parsedPolicyCtx = parser(doc);
    buildYaml({ ...parsedPolicyCtx }, "sample4-policy-gen.yml");
  } catch (e: any) {
    console.log(e.message);
  }
}

main([]);
