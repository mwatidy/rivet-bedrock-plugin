// Only import types from @ironclad/rivet-core
import type {
  ChartNode,
  EditorDefinition,
  Inputs,
  InternalProcessContext,
  NodeBodySpec,
  NodeConnection,
  NodeId,
  NodeInputDefinition,
  NodeOutputDefinition,
  NodeUIData,
  Outputs,
  PluginNodeImpl,
  PortId,
  Project,
  Rivet,
} from "@ironclad/rivet-core";

// Import AWS SDK
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Define the node type
export type MyCustomNode = ChartNode<
  "myCustomNode",
  MyCustomNodeData
>;

// Define the node data structure
export type MyCustomNodeData = {
  prompt: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  region: string;
  accessKeyId?: string; // Optional - will use local AWS credentials if not provided
  secretAccessKey?: string; // Optional - will use local AWS credentials if not provided
  useLocalCredentials: boolean; // Whether to use local credentials
  
  // Toggle fields for inputs
  usePromptInput?: boolean;
  useModelIdInput?: boolean;
  useTemperatureInput?: boolean;
  useMaxTokensInput?: boolean;
};

// Export the node function that takes in Rivet
export function myCustomNode(rivet: typeof Rivet) {
  // Node implementation
  const MyCustomNodeImpl: PluginNodeImpl<MyCustomNode> = {
    // Create a new instance of the node
    create(): MyCustomNode {
      const node: MyCustomNode = {
        // Generate a new ID
        id: rivet.newId<NodeId>(),
        
        // Default data
        data: {
          prompt: "Tell me a short story",
          modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
          temperature: 0.7,
          maxTokens: 512,
          region: "us-east-1",
          accessKeyId: "",
          secretAccessKey: "",
          useLocalCredentials: true,
        },
        
        // Default title
        title: "AWS Bedrock",
        
        // Node type
        type: "myCustomNode",
        
        // Visual data
        visualData: {
          x: 0,
          y: 0,
          width: 200,
        },
      };
      return node;
    },
    
    // Define input ports
    getInputDefinitions(
      data: MyCustomNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];
      
      if (data.usePromptInput) {
        inputs.push({
          id: "prompt" as PortId,
          dataType: "string",
          title: "Prompt",
        });
      }
      
      if (data.useModelIdInput) {
        inputs.push({
          id: "modelId" as PortId,
          dataType: "string",
          title: "Model ID",
        });
      }
      
      if (data.useTemperatureInput) {
        inputs.push({
          id: "temperature" as PortId,
          dataType: "number",
          title: "Temperature",
        });
      }
      
      if (data.useMaxTokensInput) {
        inputs.push({
          id: "maxTokens" as PortId,
          dataType: "number",
          title: "Max Tokens",
        });
      }
      
      return inputs;
    },
    
    // Define output ports
    getOutputDefinitions(
      _data: MyCustomNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeOutputDefinition[] {
      return [
        {
          id: "response" as PortId,
          dataType: "string",
          title: "Response",
        },
        {
          id: "fullResponse" as PortId,
          dataType: "object",
          title: "Full Response",
        },
      ];
    },
    
    // Define UI data
    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "AWS Bedrock",
        group: "My Custom Group",
        infoBoxBody: "Send prompts to AWS Bedrock AI models and get responses.",
        infoBoxTitle: "AWS Bedrock Node",
      };
    },
    
    // Define editors
    getEditors(
      _data: MyCustomNodeData
    ): EditorDefinition<MyCustomNode>[] {
      return [
        {
          type: "string",
          dataKey: "prompt",
          useInputToggleDataKey: "usePromptInput",
          label: "Prompt",
          placeholder: "Enter your prompt here",
        },
        {
          type: "dropdown",
          dataKey: "modelId",
          useInputToggleDataKey: "useModelIdInput",
          label: "Model ID",
          options: [
            { label: "Claude 3 Sonnet", value: "anthropic.claude-3-sonnet-20240229-v1:0" },
            { label: "Claude 3 Haiku", value: "anthropic.claude-3-haiku-20240307-v1:0" },
            { label: "Claude 3 Opus", value: "anthropic.claude-3-opus-20240229-v1:0" },
            { label: "Claude 2", value: "anthropic.claude-v2:1" },
            { label: "Titan Text", value: "amazon.titan-text-express-v1" },
            { label: "Llama 2 13B", value: "meta.llama2-13b-chat-v1" },
            { label: "Llama 2 70B", value: "meta.llama2-70b-chat-v1" },
          ],
        },
        {
          type: "number",
          dataKey: "temperature",
          useInputToggleDataKey: "useTemperatureInput",
          label: "Temperature",
          min: 0,
          max: 1,
          step: 0.01,
        },
        {
          type: "number",
          dataKey: "maxTokens",
          useInputToggleDataKey: "useMaxTokensInput",
          label: "Max Tokens",
          min: 1,
          max: 4096,
          step: 1,
        },
        {
          type: "string",
          dataKey: "region",
          label: "AWS Region",
        },
        {
          type: "toggle",
          dataKey: "useLocalCredentials",
          label: "Use Local AWS Credentials",
        },
        {
          type: "string",
          dataKey: "accessKeyId",
          label: "AWS Access Key ID",
        },
        {
          type: "string",
          dataKey: "secretAccessKey",
          label: "AWS Secret Access Key",
        },
      ];
    },
    
    // Define node body display
    getBody(
      data: MyCustomNodeData
    ): string | NodeBodySpec | NodeBodySpec[] | undefined {
      const modelNames: Record<string, string> = {
        "anthropic.claude-3-sonnet-20240229-v1:0": "Claude 3 Sonnet",
        "anthropic.claude-3-haiku-20240307-v1:0": "Claude 3 Haiku",
        "anthropic.claude-3-opus-20240229-v1:0": "Claude 3 Opus",
        "anthropic.claude-v2:1": "Claude 2",
        "amazon.titan-text-express-v1": "Titan Text",
        "meta.llama2-13b-chat-v1": "Llama 2 13B",
        "meta.llama2-70b-chat-v1": "Llama 2 70B",
      };
      
      const modelName = modelNames[data.modelId] || data.modelId;
      
      return rivet.dedent`
        AWS Bedrock
        Model: ${data.useModelIdInput ? "(Using Input)" : modelName}
        Prompt: ${data.usePromptInput ? "(Using Input)" : (data.prompt.length > 20 ? data.prompt.substring(0, 20) + "..." : data.prompt)}
        Auth: ${data.useLocalCredentials ? "Local AWS Credentials" : "Node Credentials"}
      `;
    },
    
    // Process function
    async process(
      data: MyCustomNodeData,
      inputData: Inputs,
      _context: InternalProcessContext
    ): Promise<Outputs> {
      // Get input values from inputs or data
      const prompt = rivet.getInputOrData(data, inputData, "prompt", "string");
      const modelId = rivet.getInputOrData(data, inputData, "modelId", "string");
      const temperature = rivet.getInputOrData(data, inputData, "temperature", "number");
      const maxTokens = rivet.getInputOrData(data, inputData, "maxTokens", "number");
      
      try {
        // Different models have different payload formats
        let requestBody: Record<string, any> = {};
        
        if (modelId.startsWith("anthropic.claude")) {
          // Claude models
          requestBody = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: maxTokens,
            temperature: temperature,
            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
          };
        } else if (modelId.startsWith("amazon.titan")) {
          // Amazon Titan models
          requestBody = {
            inputText: prompt,
            textGenerationConfig: {
              maxTokenCount: maxTokens,
              temperature: temperature,
            }
          };
        } else if (modelId.startsWith("meta.llama")) {
          // Meta Llama models
          requestBody = {
            prompt: `<s>[INST] ${prompt} [/INST]`,
            max_gen_len: maxTokens,
            temperature: temperature,
          };
        } else {
          throw new Error(`Unsupported model: ${modelId}`);
        }
        
        console.log(`Sending request to AWS Bedrock with model ${modelId}`);
        
        // Initialize the AWS Bedrock client
        let clientConfig: Record<string, any> = {
          region: data.region,
        };
        
        // If not using local credentials and explicit credentials are provided, use them
        if (!data.useLocalCredentials && data.accessKeyId && data.secretAccessKey) {
          clientConfig.credentials = {
            accessKeyId: data.accessKeyId,
            secretAccessKey: data.secretAccessKey,
          };
        }
        // Otherwise, use the default credential provider chain (local AWS configuration)
        
        const bedrockClient = new BedrockRuntimeClient(clientConfig);
        
        // Create the command to invoke the model
        const command = new InvokeModelCommand({
          modelId: modelId,
          body: JSON.stringify(requestBody),
          contentType: "application/json",
          accept: "application/json",
        });
        
        // Send the request to AWS Bedrock
        const response = await bedrockClient.send(command);
        
        // Parse the response
        const responseData = JSON.parse(new TextDecoder().decode(response.body));
        
        // Extract the response text based on the model
        let responseText = "";
        
        if (modelId.startsWith("anthropic.claude")) {
          // Claude models
          responseText = responseData.content?.[0]?.text || "";
        } else if (modelId.startsWith("amazon.titan")) {
          // Amazon Titan models
          responseText = responseData.results?.[0]?.outputText || "";
        } else if (modelId.startsWith("meta.llama")) {
          // Meta Llama models
          responseText = responseData.generation || "";
        } else {
          // If we don't recognize the model, just return the raw response
          responseText = JSON.stringify(responseData);
        }
        
        // Return the output
        return {
          ["response" as PortId]: {
            type: "string",
            value: responseText,
          },
          ["fullResponse" as PortId]: {
            type: "object",
            value: responseData,
          },
        };
      } catch (error) {
        // In case of error, return the error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        return {
          ["response" as PortId]: {
            type: "string",
            value: `Error: ${errorMessage}`,
          },
          ["fullResponse" as PortId]: {
            type: "object",
            value: { error: errorMessage },
          },
        };
      }
    },
  };
  
  // Create the node definition
  const customNode = rivet.pluginNodeDefinition(
    MyCustomNodeImpl,
    "AWS Bedrock"
  );
  
  // Return the node definition
  return customNode;
}