# Datree Automated aka Policy-fy

## Working
Our CLI tool takes in a Kubernetes config file, parses it using our custom Generative Algorithm to produce [Datree](https://www.datree.io/) policy.yml file that can be published to test using Datree.

**Features**

- Parsing YAML config properties upto 3 levels
- Support for Resource Limits. Ex: maximum: 25
- Supports enums, string and limit values

## Dev setup

- Pre-requisites: `yarn` package manager, `nodejs`
- Run `yarn install`
- Run `yarn generate` to create Datree policy for supplied kubernetes config file
  - Example: `yarn generate -f sample4.yml`

## Links

- [Devpost](https://devpost.com/software/shhhh)
- [Youtube Demo](https://www.youtube.com/watch?v=o3AQUmHE-Ms)
