import { ENVIRONMENT } from './utilities/config.js';
import createLogger from './utilities/logger.js';

import { BaseMessageChunk } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { RunnableMap, RunnablePassthrough } from '@langchain/core/runnables';
import chalk from 'chalk';
import camelCase from 'lodash/camelCase.js';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { createQaPromptChain } from './agents/docChat.js';
import { summarize } from './agents/summary.js';
import { gpt35TurboLLM } from './ai/llm.js';
import { ask, showSpinner } from './utilities/node.js';

const logger = createLogger('lpkg:main');

const createQueryTransfomerChain = () => {
  const SYSTEM_TEMPLATE = `You are an expert user researcher. Given an question, Do NOT answer the question. Respond back provide a suitable query that we can search the knowledge base. Keep the query short and focussed and take your time. If there's chat history, use it to set the context for the question.`;

  const HUMAN_TEMPLATE = `{question}`;

  const queryTransformPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
    new MessagesPlaceholder('chat_history'),
    HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
  ]);

  return queryTransformPrompt
    .pipe(gpt35TurboLLM)
    .pipe(new StringOutputParser())
    .withConfig({
      runName: 'query_transform_chain',
    });
};

async function main() {
  const chat_history = [] as BaseMessageChunk[];

  const docs = path.resolve('./src/docs');
  const files = await readdir(docs);
  const qaChains: any = [];

  for await (const file of files) {
    const chain = await createQaPromptChain(file);
    qaChains.push([camelCase(file), chain]);
  }

  const userQuestions = RunnableMap.from(Object.fromEntries(qaChains));

  const ragChain = RunnablePassthrough.assign({ users: userQuestions });

  while (true) {
    const query = await ask('What is your question? (type "q" to quit)');
    if (query === 'q') {
      break;
    }

    const dispose1 = showSpinner('Searching...');
    logger.log(chalk.green(query));

    const response = await ragChain.invoke({
      question: query,
      chat_history,
    });

    const responses = Object.entries(response.users).map(
      ([interview, data]) => {
        const user = interview;
        const response = (data as any).quoted_answer.answer;
        logger.log(chalk.blue(`[${user}]: ${response}`));
        if ((data as any).quoted_answer.citations.length) {
          for (const doc of (data as any).quoted_answer.citations) {
            logger.log(chalk.gray(`[${doc.sourceId}]\n${doc.quote}\n\n`));
          }
        }
        return { user, response };
      },
    );
    dispose1();

    const dispose2 = showSpinner('Summarzing...');
    const summary = await summarize(query, responses);
    logger.log(chalk.cyanBright(summary.content));
    dispose2();
  }

  return;
}

logger.log(`Starting ${ENVIRONMENT.NAME}`);
await main();
logger.log('Done!');
