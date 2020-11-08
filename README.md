# Serverless Examples

A collection of ready-to-deploy Serverless Framework services.

## Table of Contents
<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand)
  generated w/ `npm run docs`
-->
<details>
<summary>Click to expand</summary>

- [Getting Started](#getting-started)
- [Examples](#examples)
- [Community Examples](#community-examples)
- [Contributing](#contributing)
  * [Adding example code](#adding-example-code)
  * [Adding a community example](#adding-a-community-example)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Getting Started

If you are new to serverless, we recommend getting started with by creating an HTTP API Endpoint in [NodeJS](https://github.com/serverless/examples/tree/master/aws-node-simple-http-endpoint), [Python](https://github.com/serverless/examples/tree/master/aws-python-simple-http-endpoint), [Java](https://github.com/serverless/examples/tree/master/aws-java-simple-http-endpoint), or [Golang](https://github.com/serverless/examples/tree/master/aws-golang-simple-http-endpoint).

## Examples

Each example contains a `README.md` with an explanation about the service and it's use cases.

**Have an example?** Submit a PR or [open an issue](https://github.com/serverless/examples/issues). ⚡️

To install any of these you can run:

```bash
serverless install -u https://github.com/serverless/examples/tree/master/folder-name -n my-project
```

## Contributing

We are happy to accept more examples from the community. 

### Adding example code

1. Make sure your contribution matches the linting setup for this repo:

  Run the linting via

  ```bash
  npm run lint
  ```

2. Add a `package.json` file in your example with the name of the example and a `description` and any `dependencies` used.

3. Regenerate the README.md with the following command

  ```bash
  npm run docs
  ```

4. Open a new pull request with your example. 

### Adding a community example

We love hearing about projects happening in the community. Feel free to add your serverless project to our growing list.

1. Add `link`, `title`, and `description` to the [community-examples.json](https://github.com/serverless/examples/edit/master/community-examples.json) file.

2. Open a new pull request with your example. 
