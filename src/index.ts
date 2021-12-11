import * as yaml from "yaml-ast-parser";
import { buildYaml } from "./utils";
import fs from "fs";

// Get document, or throw exception on error
try {
  const doc = yaml.load(
    fs.readFileSync(__dirname + "/../k8/sample1.yml", "utf8")
  );
  // console.log(doc);
  // fs.writeFileSync(util.inspect(doc), "./dump/sample1.dump.json");
  const base = {
    apiVersion: "v1",
    policies: [
      {
        name: "policy1",
        isDefault: true,
        rules: {
          identifier: "CUSTOM_WORKLOAD_INCORRECT_ENVIRONMENT_LABELS",
          messageOnFailure:
            "Failed CUSTOM_WORKLOAD_INCORRECT_ENVIRONMENT_LABELS",
        },
      },
    ],
  };
  const context = {
    customRules: [
      {
        identifier: "CUSTOM_WORKLOAD_INCORRECT_ENVIRONMENT_LABELS",
        name: "Name for CUSTOM_WORKLOAD_INCORRECT_ENVIRONMENT_LABELS",
        defaultMessageOnFailure: "CUSTOM_WORKLOAD_INCORRECT_ENVIRONMENT_LABELS",
        schema: {
          properties: {
            metadata: {
              properties: {
                labels: {
                  properties: {
                    environment: {
                      enum: ["prod", "staging", "dev"],
                    },
                  },
                  required: "environment",
                },
              },
              required: "labels",
            },
          },
        },
      },
    ],
  };
  buildYaml({ ...base, ...context }, "sample1-policy.yml");
  // for (const key in doc) {
  //   console.log(doc.);
  // }
} catch (e) {
  console.log(e);
}
