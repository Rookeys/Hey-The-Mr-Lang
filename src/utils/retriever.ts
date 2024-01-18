import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { OpenAIEmbeddings } from '@langchain/openai'
import { createClient } from '@supabase/supabase-js'

export const retriever = () => {
  const openAIApiKey = process.env.OPENAI_API_KEY

  const embeddings = new OpenAIEmbeddings({ openAIApiKey })
  const sbApiKey = process.env.SUPABASE_API_KEY
  const sbUrl = process.env.SUPABASE_URL

  if (!sbApiKey || !sbUrl) {
    return;
  }

  const client = createClient(sbUrl, sbApiKey)
  // const llm = new ChatOpenAI({ openAIApiKey })

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'documents',
    queryName: 'match_documents'
  })

  const retriever = vectorStore.asRetriever()

  return retriever
}
