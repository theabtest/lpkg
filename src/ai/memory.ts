import { BufferMemory } from 'langchain/memory';

// Notice that we need to align the `memoryKey` with the variable in the prompt
export const llmMemory = new BufferMemory({ memoryKey: 'chat_history' });
