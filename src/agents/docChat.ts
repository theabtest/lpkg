import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { Document } from '@langchain/core/documents';
import { JsonOutputKeyToolsParser } from '@langchain/core/output_parsers/openai_tools';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { RunnablePassthrough } from '@langchain/core/runnables';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'node:fs';
import path from 'node:path';
import { embedding } from '../ai/embedding.js';
import { gpt35TurboLLM } from '../ai/llm.js';
import { quotedAnswerTool } from '../citation.js';

const getParts = async (filePath: string) => {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 400,
  });

  const splitDocs = await textSplitter.splitDocuments(docs);
  return splitDocs;
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

const loadVectorStoreForUser = async (docname: string) => {
  const dir = path.resolve('./src/docs');
  const output = path.resolve(`./dist/${docname}`);
  if (fs.existsSync(output)) {
    const vectorStore = await FaissStore.load(output, embedding);
    return vectorStore;
  }
  console.log('Loading', docname);
  const filePath = path.join(dir, docname);
  const data = await getParts(filePath);
  const vectorStore = await FaissStore.fromDocuments(data, embedding);
  await vectorStore.save(output);
  return vectorStore;
};

export const createQaPromptChain = async (docname: string) => {
  const vectorStore = await loadVectorStoreForUser(docname);
  const retriever = vectorStore.asRetriever(3);

  const qaSystemPrompt = `You are a user research assistant. Given the question and the knowledge data from the interview transcript, provide a quoted answer from the knowledge base. If you don't know the answer, then respond with I don't know. Don't make up an answer. Take your time and be detailed with your answer.

CONTEXT:\n
{context}`;

  const qaPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(qaSystemPrompt),
    HumanMessagePromptTemplate.fromTemplate('{question}'),
  ]);

  const llmWithTool = gpt35TurboLLM.bind({
    tools: [quotedAnswerTool],
    tool_choice: quotedAnswerTool,
  });

  const outputParser = new JsonOutputKeyToolsParser({
    keyName: 'quoted_answer',
    returnSingle: true,
  });

  const chain = qaPrompt.pipe(llmWithTool).pipe(outputParser);

  const qaUser = RunnablePassthrough.assign({
    context: async (input: any) => {
      const docs = retriever.pipe(formatDocsWithId).invoke(input['question']);
      return docs;
    },
  })
    .assign({
      quoted_answer: chain,
    })
    .pick(['quoted_answer']);

  return qaUser;
};
