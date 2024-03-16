import { DynamicStructuredTool } from '@langchain/core/tools';
import z from 'zod';
import { getSerpApiData } from './serpApiRequest.js';

const BusinessSearchToolSchema = z.object({
  name: z.string().describe('The name of the business'),
  location: z.string().describe('The complete address of the business'),
});

export const businessSearchTool = new DynamicStructuredTool({
  name: 'businessSearch',
  description: 'Search google for the details of a business',
  schema: BusinessSearchToolSchema,
  func: async ({ name, location }) => {
    const result = await getSerpApiData({ name, location });
    return JSON.stringify(result, null, 2);
  },
  tags: ['business', 'search', 'google'],
  verbose: true,
});
