import { StructuredTool } from '@langchain/core/tools';
import { formatToOpenAITool } from '@langchain/openai';
import z from 'zod';

const citationSchema = z.object({
  sourceId: z
    .number()
    .describe(
      'The integer ID of a SPECIFIC source which justifies the answer.',
    ),
  quote: z
    .string()
    .describe(
      'The VERBATIM quote from the specified source that justifies the answer.',
    ),
});

class QuotedAnswer extends StructuredTool {
  name = 'quoted_answer';

  description =
    'Answer the user question based only on the given sources, and cite the sources used.';

  schema = z.object({
    answer: z
      .string()
      .describe(
        'The answer to the user question, which is based only on the given sources.',
      ),
    citations: z
      .array(citationSchema)
      .describe('Citations from the given sources that justify the answer.'),
  });

  constructor() {
    super();
  }

  _call(input: z.infer<(typeof this)['schema']>): Promise<string> {
    return Promise.resolve(JSON.stringify(input, null, 2));
  }
}

export const quotedAnswerTool = formatToOpenAITool(new QuotedAnswer());
