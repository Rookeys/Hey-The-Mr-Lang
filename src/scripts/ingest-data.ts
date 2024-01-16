import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';

/* Name of directory to retrieve your files from */
const filePath = 'data/bts.txt';
const savePath = 'store'

export const run = async () => {
  try {
    const loader = new TextLoader(filePath);
    const rawDocs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    })

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('creating vector store...');

    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
    await vectorStore.save(savePath);
  } catch(error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }

};

(async () => {
  await run();
  console.log('ingestion complete');
})();
