// Only import types from @ironclad/rivet-core, not actual Rivet code
import type { RivetPlugin, RivetPluginInitializer } from "@ironclad/rivet-core";

import { myCustomNode } from "./nodes/MyCustomNode.js";

// A Rivet plugin must default export a plugin initializer function
const plugin: RivetPluginInitializer = (rivet) => {
  // Initialize the node by passing it the Rivet library
  const customNode = myCustomNode(rivet);

  // The plugin object definition
  const myPlugin: RivetPlugin = {
    // Unique ID for your plugin
    id: "aws-bedrock-plugin",

    // The display name in the Rivet UI
    name: "AWS Bedrock Plugin",

    // Define any configuration settings
    configSpec: {
      region: {
        type: "string",
        label: "Default AWS Region",
        description: "The default AWS region to use",
        helperText: "Default: us-east-1",
      },
      useLocalCredentials: {
        type: "boolean",
        label: "Use Local AWS Credentials by Default",
        description: "Whether to use your local AWS credentials by default. Enable to use credentials from your ~/.aws/credentials file",
      },
    },

    // Define any additional context menu groups
    contextMenuGroups: [
      {
        id: "aws-bedrock",
        label: "AWS Bedrock",
      },
    ],

    // Register your nodes
    register: (register) => {
      register(customNode);
    },
  };

  // Return the plugin definition
  return myPlugin;
};

// Default export the plugin
export default plugin;