import { ChatOpenAI } from '@langchain/openai';
import { ENVIRONMENT } from '../utilities/config.js';

export const gpt35TurboLLM = new ChatOpenAI({
  openAIApiKey: ENVIRONMENT.OPENAI_API_KEY,
  temperature: 0.2,
  topP: 1,
  verbose: true,
  modelName: 'gpt-3.5-turbo',
});
