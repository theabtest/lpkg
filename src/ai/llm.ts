import { ChatOpenAI } from '@langchain/openai';
import { ENVIRONMENT } from '../utilities/config.js';

export const gpt35TurboLLM = new ChatOpenAI({
  openAIApiKey: ENVIRONMENT.OPENAI_API_KEY,
  temperature: 0.2,
  topP: 1,
  verbose: ENVIRONMENT.DEBUG,
  modelName: 'gpt-3.5-turbo',
});

export const gpt4 = new ChatOpenAI({
  openAIApiKey: ENVIRONMENT.OPENAI_API_KEY,
  temperature: 0.5,
  topP: 1,
  verbose: ENVIRONMENT.DEBUG,
  modelName: 'gpt-4',
});
