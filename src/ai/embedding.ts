import { OpenAIEmbeddings } from '@langchain/openai';
import { ENVIRONMENT } from '../utilities/config.js';

const embedding = new OpenAIEmbeddings({
  openAIApiKey: ENVIRONMENT.OPENAI_API_KEY,
});

export { embedding };
