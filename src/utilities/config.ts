import dotenv from 'dotenv';

dotenv.config();

interface Config {
  OPENAI_API_KEY: string;
}

declare var process: {
  env: Config;
};

const ENVIRONMENT: Config = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
};

export { ENVIRONMENT };
