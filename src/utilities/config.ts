import dotenv from 'dotenv';

dotenv.config();

interface Config {
  NAME: string;
  OPENAI_API_KEY: string;
  OLLAMA_BASE_URL: string;
}

declare var process: {
  env: Config;
};

const ENVIRONMENT: Config = {
  NAME: 'LPKG',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
};

export { ENVIRONMENT };
