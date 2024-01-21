import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import { createClient } from '@supabase/supabase-js';
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

/* Name of directory to retrieve your files from */
const filePath = 'data/jeongmin-info.txt';

export const run = async () => {
  try {

    const loader = new TextLoader(filePath);
    const rawDocs = await loader.load();

    console.log('file text splitting');

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
      separators: ['\n\n', '\n', '. ', '? ', '! ', '.\n', '?\n', '!\n']
    })

    const docs = await textSplitter.splitDocuments(rawDocs);
    
    console.log('checking envrionment variables');

    const supabase_api_key = process.env.SUPABASE_API_KEY;
    const sbUrl = process.env.SUPABASE_URL;
    const openAIApiKey = process.env.OPENAI_API_KEY;
    const client = createClient(sbUrl as string, supabase_api_key as string);

    console.log('connecting to supabase')

      // Check if there is any data in the relevant table
      let { data: existingData, error } = await client.from('documents').select('*').limit(1);
      if (error) {
        throw Error('Error fetching data from Supabase:');
      }
  
      // If data exists, skip the rest of the process
      if (existingData && existingData.length > 0) {
        console.log('Data already exists in Supabase, skipping process.');
        return;
      }
    
      await SupabaseVectorStore.fromDocuments(
        docs,
        new OpenAIEmbeddings({ openAIApiKey }),
        {
          client,
          tableName: 'documents',
        }
      )
      console.log('vector data created in Supabase');

   

  } catch(error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }

};

(async () => {
  await run();
  console.log('ingestion complete');
})();
