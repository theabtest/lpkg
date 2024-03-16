import { PromptTemplate } from '@langchain/core/prompts';
import { ToolParameters } from 'llamaindex';
import { model } from './ai/model.js';
import { ENVIRONMENT } from './utilities/config.js';
import logger, { agentLogger, userLogger } from './utilities/logger.js';
import { ask } from './utilities/node.js';

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

// const llm = new Ollama({
//   baseUrl: ENVIRONMENT.OLLAMA_BASE_URL,
//   verbose: true,
//   model: 'codellama',
// });

// Notice that a "chat_history" variable is present in the prompt template
const template = `You are an expert programmer that writes simple, concise code and explanations. You can only understand and write code in TypeScript. You will always answer the questions with a markdown code block containing TypeScript code that solves the problem and a brief explanation of the code below the markdown code block.

You are currently helping the user solve a programming problem in TypeScript and that is the GOAL. Whenever the user gives you FEEDBACK, you should modify the PREVIOUS output to incorporate the feedback and then provide a new RESPONSE. Be sure to remember to include all the goals.
===========================
Goal: {input}
===========================
PreviousResponse: {previous}
===========================
Response:`;

const prompt = PromptTemplate.fromTemplate(template);

// const jsonSchema = {
//   title: "Person",
//   description: "Identifying information about a person.",
//   type: "object",
//   properties: {
//     name: { title: "Name", description: "The person's name", type: "string" },
//     age: { title: "Age", description: "The person's age", type: "integer" },
//     fav_food: {
//       title: "Fav Food",
//       description: "The person's favorite food",
//       type: "string",
//     },
//   },
//   required: ["name", "age"],
// };

// const outputParser = new JsonOutputFunctionsParser();

// const runnable = createStructuredOutputRunnable({
//   outputSchema: jsonSchema,
//   llm: model,
//   prompt:prompt,
//   outputParser
// })

async function main() {
  // const conversationChain = new LLMChain({
  //   llm,
  //   prompt,
  //   verbose: true,
  //   memory: llmMemory,
  //   outputKey: 'response',
  // });

  const goal = await ask('What is the programming problem you want to solve? ');
  const chain = prompt.pipe(model);
  const result = await chain.invoke({
    input: goal,
    previous: '',
  });

  agentLogger.log(result.content);

  let loop = true;
  let context = [goal];
  let stack = [result.content.toString()];
  do {
    const feedback = await ask('What is next? q to quit. undo to go back.');
    loop = feedback !== 'q';
    if (!loop) {
      logger('Quitting');
      process.exit(0);
    }

    if (feedback === 'undo') {
      context.pop();
      stack.pop();
      continue;
    }

    context.push(feedback);
    const previous = stack[stack.length - 1];
    const response = await chain.invoke({
      input: context.join('\n'),
      previous: previous ?? '',
    });

    userLogger.log(feedback);
    agentLogger.log(response.content.toString());
    stack.push(response.content.toString());
  } while (loop);
}

logger(`Starting ${ENVIRONMENT.NAME}`);
await main();
logger('Done!');
