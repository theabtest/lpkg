import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { ENVIRONMENT } from './utilities/config.js';
import createLogger, { debugStream } from './utilities/logger.js';

import { Document } from '@langchain/core/documents';
import { BaseMessageChunk } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { JsonOutputKeyToolsParser } from '@langchain/core/output_parsers/openai_tools';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { RunnablePassthrough } from '@langchain/core/runnables';
import chalk from 'chalk';
import { readdir } from 'fs/promises';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import path from 'path';
import { embedding } from './ai/embedding.js';
import { gpt35TurboLLM } from './ai/llm.js';
import { quotedAnswerTool } from './citation.js';
import { ask } from './utilities/node.js';

const logger = createLogger('lpkg:main');
const directory = 'dist/output';

const getParts = async (filePath: string) => {
  logger.log(`Loading ${filePath}`);
  const loader = new PDFLoader(filePath, {
    splitPages: false,
  });
  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 400,
  });

  const splitDocs = await textSplitter.splitDocuments(docs);
  return splitDocs;
};

async function loadDocs(useCached = true) {
  if (useCached) {
    const vectorStore = await FaissStore.load(directory, embedding);
    return vectorStore;
  }
  const dir = path.resolve('./src/docs');
  const files = await readdir(dir);
  const docArray = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file);
      return await getParts(filePath);
    }),
  );
  const docs = docArray.flat();
  const vectorStore = await FaissStore.fromDocuments(docs, embedding);
  await vectorStore.save(directory);
  return vectorStore;
}

const createQueryTransfomerChain = () => {
  const SYSTEM_TEMPLATE = `You are an expert user researcher. Given an question, Do NOT answer the question. Instead, identify the hypothesis and theme of the question and provide a suitable query that we can ask the knowledge base. Use keywords and phrases that are relevant to the question. And keep the query short and concise. Take your time. If there's chat history, use it to set the context for the question.`;

  const HUMAN_TEMPLATE = `{question}`;

  const queryTransformPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
    new MessagesPlaceholder('chat_history'),
    HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
  ]);

  return queryTransformPrompt
    .pipe(gpt35TurboLLM)
    .pipe(new StringOutputParser())
    .withListeners(debugStream('query_transform_chain'))
    .withConfig({
      runName: 'query_transform_chain',
      tags: ['query_transform'],
    });
};

const createQaPromptChain = () => {
  const qaSystemPrompt = `You are a user research assistant. Given the question, chat history and the context for the current question, provide a quoted answer from the knowledge base. If you detect alternative relavant data points, suggest them as well. Tkae your time and be as detailed and accurate as possible.

{context}`;

  const qaPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(qaSystemPrompt),
    new MessagesPlaceholder('chat_history'),
    HumanMessagePromptTemplate.fromTemplate('{question}'),
  ]);

  const outputParser = new JsonOutputKeyToolsParser({
    keyName: 'quoted_answer',
    returnSingle: true,
  });

  const llmWithTool = gpt35TurboLLM.bind({
    tools: [quotedAnswerTool],
    tool_choice: quotedAnswerTool,
  });

  return qaPrompt
    .pipe(llmWithTool)
    .pipe(outputParser)
    .withListeners(debugStream('qa_prompt_chain'))
    .withConfig({
      runName: 'qa_prompt_chain',
      tags: ['qa_prompt'],
    });
};

const formatDocsWithId = (docs: Array<Document>): string => {
  return (
    '\n\n' +
    docs
      .map(
        (doc: Document, idx: number) =>
          `
Source ID: ${idx}
Article title: ${doc.metadata['source']}
Location: from - ${doc.metadata['loc']?.['lines']?.['from']}, to - ${doc.metadata['loc']?.['lines']?.['to']}
Article Snippet: ${doc.pageContent}`,
      )
      .join('\n\n')
  );
};

async function main() {
  const vectorStore = await loadDocs();
  const retriever = vectorStore.asRetriever(10);
  const contextualizeQChain = createQueryTransfomerChain();
  const qaChain = createQaPromptChain();
  const chat_history = [] as BaseMessageChunk[];

  const ragChain = RunnablePassthrough.assign({
    question: contextualizeQChain,
  })
    .assign({
      context: async (input: any) => {
        const docs = retriever.pipe(formatDocsWithId).invoke(input['question']);
        return docs;
      },
    })
    .assign({ quoted_answer: qaChain })
    .pick(['quoted_answer', 'docs'])
    .withListeners(debugStream('rag_chain'))
    .withConfig({ runName: 'rag_chain' });

  while (true) {
    const query = await ask('What is your question? (type "q" to quit)');
    if (query === 'q') {
      break;
    }

    const response = await ragChain.invoke(
      {
        question: query,
        chat_history,
      },
      {
        metadata: {
          session: 'test',
        },
        runName: 'run_session_1',
        tags: ['chat'],
      },
    );

    logger.log(chalk.green(response.quoted_answer.answer));
    for (const doc of response.quoted_answer.citations) {
      logger.log(chalk.gray(`[${doc.sourceId}]\n${doc.quote}\n\n`));
    }
  }

  return;
}

logger.log(`Starting ${ENVIRONMENT.NAME}`);
await main();
logger.log('Done!');
