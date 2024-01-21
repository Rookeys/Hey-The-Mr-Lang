import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { OpenAIEmbeddings } from '@langchain/openai'
import { createClient } from '@supabase/supabase-js'

const openAIApiKey = process.env.OPENAI_API_KEY
const embeddings = new OpenAIEmbeddings({ openAIApiKey })
const sbApiKey = process.env.SUPABASE_API_KEY
const sbUrl = process.env.SUPABASE_URL
const client = createClient(sbUrl as string, sbApiKey as string)

export const getRemoteRetriver = async () => {

    console.log('Loading existing remote vector store...')

    const vectorStore = new SupabaseVectorStore(embeddings, {
        client,
        tableName: 'documents',
        queryName: 'match_documents'
    })

    console.log('Vector store loaded.')

    return vectorStore.asRetriever()
}
