import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { gpt35TurboLLM } from '../ai/llm.js';
import { businessSearchTool } from '../functions/businessSearch/index.js';
import { ENVIRONMENT } from '../utilities/config.js';

const tools = [businessSearchTool];

const template =
  'You a helpful assistant that can help find information about businesses.' as const;
const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(template);

const humanTemplate = `Give me the details of a business {name} in {location}.  
Thought:{agent_scratchpad}` as const;
const humanMessagePrompt =
  HumanMessagePromptTemplate.fromTemplate(humanTemplate);

const chatPrompt = ChatPromptTemplate.fromMessages<{
  name: string;
  location: string;
}>([systemMessagePrompt, humanMessagePrompt]);

const agent = await createOpenAIToolsAgent({
  llm: gpt35TurboLLM,
  tools,
  prompt: chatPrompt,
});

export const businessSearchAgent = new AgentExecutor({
  agent,
  tools,
  verbose: ENVIRONMENT.DEBUG,
  tags: ['business', 'search', 'google', 'agent'],
});
