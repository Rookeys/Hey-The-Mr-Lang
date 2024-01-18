import { PromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { createClient } from '@supabase/supabase-js'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { NextApiRequest, NextApiResponse } from 'next'
import { StringOutputParser } from '@langchain/core/output_parsers' 

// 사용자가 질문한 내용 독립형 질문으로 만들기 (promptTemplate 활용)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const openAIApiKey = process.env.OPENAI_API_KEY

    const embeddings = new OpenAIEmbeddings({ openAIApiKey })
    const sbApiKey = process.env.SUPABASE_API_KEY
    const sbUrl = process.env.SUPABASE_URL

    if (!sbApiKey || !sbUrl) {
      res.status(401).json({ message: "Don't have permissions on supabase." });
      return;
    }

    const client = createClient(sbUrl, sbApiKey)
    const llm = new ChatOpenAI({ openAIApiKey })

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client,
      tableName: 'documents',
      queryName: 'match_documents'
    })

    const retriever = vectorStore.asRetriever()

    const standaloneQuestionTemplate = 'Given a question, convert it to a standalone question. question: {question} standalone question:'

    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

    const chain = standaloneQuestionPrompt.pipe(llm).pipe(new StringOutputParser()).pipe(retriever)


    const response = await chain.invoke({
      question: 'What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful'
    })


    console.log(response )


  } catch (error) {
    console.log(error)
  }
}

