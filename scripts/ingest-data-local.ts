import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from '@langchain/openai';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { getSplittedDocs } from '@/util/getSplittedDocs';
import fs from "fs"

/* Name of directory to retrieve your files from */
const DATA_STORE_PATH = 'data/jeongmin-info.txt';
const VECTOR_STORE_PATH = 'store'

export const run = async () => {
    if (fs.existsSync(VECTOR_STORE_PATH)) {
        console.log('📚 Data already exists in Supabase, skipping process.\n');
        return;
      } else {
        try {
            const docs = await getSplittedDocs({
                filePath: DATA_STORE_PATH,
                chunkSize: 500,
                chunkOverlap: 100,
            })
            console.log('🔨 Creating vector store...\n');
        
            const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
            await vectorStore.save(VECTOR_STORE_PATH);
          } catch(error) {
            console.log('❌ Error', error);
            throw new Error('Failed to ingest your data');
          }
        
      }
};

(async () => {
  await run();
  console.log('✅ Ingestion complete\n');
})();