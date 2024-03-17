import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { gpt4 } from '../ai/llm.js';

export const summarize = (
  input: string,
  responses: {
    user: string;
    response: string;
  }[],
) => {
  const chatPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `You are a user reseacher. Given the responses from various interviews for a question, provide detailed infomation about:
      
      Summary: Summarize the responses for the question.  
      Strongest Signal: The interview that showed the strongest signal for the question.
      Weakest Signal: The interview that showed the weakest signal for the question.
      Detailed Analysis:
        Common Themes: What are the common themes in the responses?
        Unique Themes: What are the unique themes in the responses?
        Contradictions: What are the contradictions in the responses?
      Gaps:
        What interviews showed a gap in the responses?
        What follow up questions need to be asked to fill the gap?

      Take your time and be detailed with your answer. Don't make up information. If the interview response was I don't know, then exclude it.
      
      Responses:\n {data}`,
    ),
    HumanMessagePromptTemplate.fromTemplate('{question}'),
  ]);

  const data = responses
    .map((r) => `User: ${r.user}\nResponse: ${r.response}\n\n`)
    .join('\n\n');

  return chatPrompt.pipe(gpt4).invoke({
    question: input,
    data,
  });
};
