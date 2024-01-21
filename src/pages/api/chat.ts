import { PromptTemplate } from "@langchain/core/prompts"
import type { NextApiRequest, NextApiResponse } from 'next'

import { answerTemplate, standaloneQuestionTemplate } from "@/templates/about_me"
import { combineDocuments } from "@/util/combineDocument"
import { getRemoteRetriver } from "@/util/remoteRetriever"
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables"
import { ChatOpenAI } from "@langchain/openai"

import { getLocalRetriever } from "@/util/localRetriever"
import fs from "fs"

 
export default async  function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const {conversation_history, question} = req.body
  const openAIApiKey = process.env.OPENAI_API_KEY
  const llm = new ChatOpenAI({ openAIApiKey })
  const VECTOR_STORE_PATH = "store";
  let retriever;
  
  console.log("🔍 Checking for existing vector store...");
  
   // 벡터 스토어가 로컬에 존재하는지 확인합니다.  
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    console.log("📚 Vector store found, using local retriever...");
    retriever = await getLocalRetriever()
  } else {
    console.log("🌐 Vector store not found, using remote retriever...");
    retriever = await getRemoteRetriver()
  }
  
  // 독립적 질문 생성 
  const standaloneQuestionChain = createStandaloneQuestionChain(llm);

  // 리트리버 체인 생성
  const retrieverChain = createRetrieverChain(retriever);

  // 답변 체인 생성
  const answerChain = createAnswerChain(llm);
      
  console.log("🔗 Building the runnable sequence chain...");

  // 체이닝 생성
  const chain = RunnableSequence.from([
  {
      standalone_question: standaloneQuestionChain,
      original_input: new RunnablePassthrough()
  },
  {
      context: retrieverChain,
      question: ({original_input}) => original_input.question,
      conversation_history: ({original_input}) => original_input.conversation_history
  },
  answerChain
  ])

  console.log("🚀 Invoking the runnable sequence chain...");

  // 체이닝 실행
  const response = await chain.invoke({
    question,
    conversation_history
  })
  console.log("✅ Runnable sequence chain invoked successfully!");

  res.status(200).json({ response })
    
}

function createStandaloneQuestionChain(llm: ChatOpenAI) {
  const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate);
  return standaloneQuestionPrompt
    .pipe(llm)
    .pipe(new StringOutputParser());
}

function createRetrieverChain(retriever: any) {
  return RunnableSequence.from([
    prevResult => prevResult.standalone_question,
    retriever,
    combineDocuments
  ]);
}

function createAnswerChain(llm: ChatOpenAI) {
  const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);
  return answerPrompt
    .pipe(llm)
    .pipe(new StringOutputParser());
}
