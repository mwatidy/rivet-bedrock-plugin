# AWS Bedrock Plugin for Rivet

A custom plugin for [Rivet](https://github.com/Ironclad/rivet) that adds nodes for interacting with AWS Bedrock AI models.

## Features

The plugin adds an AWS Bedrock node that:
- Sends prompts to AWS Bedrock AI models
- Supports multiple models including Claude 3 models, Amazon Titan, and Meta's Llama 2
- Configurable parameters like temperature and max tokens
- Returns both the text response and the full API response
- Uses your local AWS credentials by default

## Prerequisites

To use this plugin, you need:
- An AWS account with access to AWS Bedrock
- AWS credentials configured on your machine (in ~/.aws/credentials) or explicit credentials provided in the node
- Models enabled in your AWS Bedrock console

## Authentication Options

This plugin offers two ways to authenticate with AWS Bedrock:

1. **Local AWS Credentials (Recommended)**: Uses the credentials from your local AWS configuration (~/.aws/credentials or environment variables)
2. **Explicit Credentials**: Directly enter your AWS Access Key ID and Secret Access Key in the node settings

## Using the plugin

### In Rivet

To use this plugin in Rivet:

1. Open the plugins overlay at the top of the screen.
2. Search for "aws-bedrock-plugin"
3. Click the "Install" button to install the plugin into your current project.
4. Configure your AWS credentials in the plugin settings.

### In Code

Load the plugin and Rivet into your application:

```ts
import * as Rivet from "@ironclad/rivet-core";
import awsBedrockPlugin from "aws-bedrock-plugin";
```

Register the plugin with Rivet:

```ts
Rivet.globalRivetNodeRegistry.registerPlugin(awsBedrockPlugin(Rivet));
```

## Supported Models

- Claude 3 Sonnet
- Claude 3 Haiku
- Claude 3 Opus
- Claude 2
- Amazon Titan Text
- Meta Llama 2 (13B and 70B variants)

## Local Development

1. Run `yarn install` to install dependencies
2. Run `yarn dev` to start the compiler and bundler in watch mode. This will automatically recompile and rebundle your changes into the `dist` folder. This will also copy the bundled files into the plugin install directory.
3. After each change, you must restart Rivet to see the changes.

## Implementation Details

This plugin uses the AWS SDK to make real API calls to AWS Bedrock. The implementation handles:

1. Different model formats (Claude, Titan, Llama)
2. Authentication via local AWS credentials or explicit credentials
3. Parsing of responses based on model type
4. Error handling with informative messages

### Request Formats

Different models in AWS Bedrock require different request formats:

- **Claude models**: Uses the Anthropic API format with messages array
- **Titan models**: Uses Amazon's specific format with inputText and textGenerationConfig
- **Llama models**: Uses Meta's format with specific prompt formatting

## Security Note

This plugin can use your AWS credentials to function. If you choose to use explicit credentials rather than local AWS credentials, they will be stored in your Rivet project file. Always be careful with your AWS credentials and follow AWS security best practices.

Recommendations:
- Use local AWS credentials when possible
- Create IAM users with limited permissions specifically for AWS Bedrock
- Regularly rotate your access keys
- Never share your Rivet project files that contain credentials

If you need to share a Rivet project that uses this plugin, make sure to clear any explicit credentials first.