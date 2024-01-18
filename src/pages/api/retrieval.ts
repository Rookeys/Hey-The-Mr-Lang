import { combineDocuments } from '@/utils/combineDocuments'
import { retriever } from '@/utils/retriever'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { NextApiRequest, NextApiResponse } from 'next'

// 사용자가 질문한 내용 독립형 질문으로 만들기 (promptTemplate 활용)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const openAIApiKey = process.env.OPENAI_API_KEY

    const llm = new ChatOpenAI({ openAIApiKey })

    const retrieverValue = retriever()
    if (!retrieverValue) {
      res.status(404).json({ message: "Invalid request." });
      return;
    }

    const standaloneQuestionTemplate = 'Given a question, convert it to a standalone question. question: {question} standalone question:'

    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

    const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email woalswhwh@gmail.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
    context: {context}
    question: {question}
    answer:
    `

    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)

    const chain = standaloneQuestionPrompt.pipe(llm).pipe(new StringOutputParser()).pipe(retrieverValue).pipe(combineDocuments).pipe(answerPrompt)


    const response = await chain.invoke({
      question: 'What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.'
    })

    console.log(response)


  } catch (error) {
    console.log(error)
  }
}

