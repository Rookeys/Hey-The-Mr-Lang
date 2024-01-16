import { makeChain } from '@/util/makechain';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;
  const directory = 'store';

  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results

  try {
    const loadedVectorStore = await HNSWLib.load(
      directory,
      new OpenAIEmbeddings({}),

    );

    //create chain
    const chain = await makeChain(loadedVectorStore);

    // Ask a question using chat history
    
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
