import { FunctionTool, OpenAIAgent, ToolParameters } from 'llamaindex';
import { ENVIRONMENT } from './utilities/config.js';

console.log('API Key:', ENVIRONMENT);

// Define a function to sum two numbers
function sumNumbers({ a, b }: { a: number; b: number }): number {
  return a + b;
}

// Define a function to divide two numbers
function divideNumbers({ a, b }: { a: number; b: number }): number {
  return a / b;
}

// Define the parameters of the sum function as a JSON schema
const sumJSON: ToolParameters = {
  type: 'object',
  properties: {
    a: {
      type: 'number',
      description: 'The first number',
    },
    b: {
      type: 'number',
      description: 'The second number',
    },
  },
  required: ['a', 'b'],
};

// Define the parameters of the divide function as a JSON schema
const divideJSON: ToolParameters = {
  type: 'object',
  properties: {
    a: {
      type: 'number',
      description: 'The dividend to divide',
    },
    b: {
      type: 'number',
      description: 'The divisor to divide by',
    },
  },
  required: ['a', 'b'],
};

async function main() {
  // Create a function tool from the sum function
  const sumFunctionTool = new FunctionTool(sumNumbers, {
    name: 'sumNumbers',
    description: 'Use this function to sum two numbers',
    parameters: sumJSON,
  });

  // Create a function tool from the divide function
  const divideFunctionTool = new FunctionTool(divideNumbers, {
    name: 'divideNumbers',
    description: 'Use this function to divide two numbers',
    parameters: divideJSON,
  });

  // Create an OpenAIAgent with the function tools
  const agent = new OpenAIAgent({
    tools: [sumFunctionTool, divideFunctionTool],
    verbose: true,
  });

  // Chat with the agent
  const response = await agent.chat({
    message: 'How much is 5 + -5? then divide by 0',
  });

  // Print the response
  console.log(String(response));
}

main().then(() => {
  console.log('Done');
});
