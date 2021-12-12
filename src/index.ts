import { Command } from "commander";
import consola from "consola";
import yaml from "js-yaml";
import { buildYaml } from "./utils";
import fs from "fs";
import { parser } from "./parser";

const program = new Command();
program.version("1.0.0");
program.option(
  "-f, --filename <type>",
  "filename of k8 config only (Don't add path). Ex: sample4.yml"
);
program.parse(process.argv);

function main() {
  try {
    const { filename } = program.opts();
    if (!filename) {
      consola.error("Enter k8 filename to generate Datree policy!");
      return;
    }
    const doc = yaml.load(
      fs.readFileSync(__dirname + `/../k8/${filename}`, "utf8")
    );
    // console.log(doc);
    // fs.writeFileSync(
    //   __dirname + "/../output/sample1.dump.json",
    //   JSON.stringify(doc)
    // );
    const parsedPolicyCtx = parser(doc);
    buildYaml({ ...parsedPolicyCtx }, `${filename}-policy-gen.yml`);
    consola.success(
      `Successfully generated Datree policy! Location -> ./output/${filename}`
    );
  } catch (e: any) {
    console.log(e.message);
  }
}

main();
