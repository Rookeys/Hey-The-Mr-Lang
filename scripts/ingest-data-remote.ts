import { getSplittedDocs } from '@/util/getSplittedDocs';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createClient } from "@supabase/supabase-js";

/* Name of directory to retrieve your files from */
const filePath = 'data/jeongmin-info.txt';

export const run = async () => {
  try {

    const docs = await getSplittedDocs({
      filePath,
      chunkSize: 500,
      chunkOverlap: 100,
    })
    
    console.log('🔍 Checking environment variables\n');

    const supabase_api_key = process.env.SUPABASE_API_KEY;
    const sbUrl = process.env.SUPABASE_URL;
    const openAIApiKey = process.env.OPENAI_API_KEY;
    const client = createClient(sbUrl as string, supabase_api_key as string);

    console.log('🔗 Connecting to Supabase\n');

      // Check if there is any data in the relevant table
      let { data: existingData, error } = await client.from('documents').select('*').limit(1);
      if (error) {
        throw Error('Error fetching data from Supabase:');
      }
  
      // If data exists, skip the rest of the process
      if (existingData && existingData.length > 0) {
        console.log('📚 Data already exists in Supabase, skipping process.\n');
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
      console.log('🎉 Vector data created in Supabase\n');

   

  } catch(error) {
    console.log('❌ Error', error);
    throw new Error('Failed to ingest your data');
  }

};