const yaml = require("js-yaml");
const fs = require("fs");

// Get document, or throw exception on error
try {
  const doc = yaml.load(fs.readFileSync("./k8/sample1.yml", "utf8"));
  console.log(doc);
} catch (e) {
  console.log(e);
}
