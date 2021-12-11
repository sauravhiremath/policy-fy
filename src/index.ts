import * as yaml from "yaml-ast-parser";
import fs from "fs";

// Get document, or throw exception on error
try {
  const doc = yaml.load(
    fs.readFileSync(__dirname + "/../k8/sample1.yml", "utf8")
  );
  console.log(doc);
  // fs.writeFileSync(util.inspect(doc), "./dump/sample1.dump.json");
  // for (const key in doc)
} catch (e) {
  console.log(e);
}
