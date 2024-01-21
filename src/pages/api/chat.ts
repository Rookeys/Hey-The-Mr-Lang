import { PromptTemplate } from "@langchain/core/prompts"
import type { NextApiRequest, NextApiResponse } from 'next'

import { StringOutputParser } from '@langchain/core/output_parsers'
import { retriever } from "@/util/retriever"
import { ChatOpenAI } from "@langchain/openai"
import { combineDocuments } from "@/util/combineDocument"
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables"
import { answerTemplate, standaloneQuestionTemplate } from "@/templates/about_me"
 
export default async  function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

// parse data from req.body
const {conversation_history, question} = req.body
    

// get API KEY and create llm instance
const openAIApiKey = process.env.OPENAI_API_KEY
const llm = new ChatOpenAI({ openAIApiKey })

// generate Prompt with template
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)
const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)

const standaloneQuestionChain = standaloneQuestionPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())


// 체인에 retriever를 이어서 체이닝을 하려면 처음에는 안되는데 그 이유는 
// llm의 출력은 객체로 나오게되는데, 이는 output parser를 통해서 string으로 변환을 해주고, retriever를 붙여줘야한다.
const retrieverChain = RunnableSequence.from([
    prevResult => prevResult.standalone_question,
    retriever,
    combineDocuments
])

// genrate answer with llm and parse it to true string.
const answerChain = answerPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())


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

// RunnableSequence에서 먼저 앞에서 실행한 결과값을 콘솔찍어볼수 잇다.
// prevResult => console.log(prevResult),

// const chain = RunnableSequence.from([
//     punctuationPrompt,
//     llm,
//     new StringOutputParser(),
//     prevResult => console.log(prevResult),
//     grammarPrompt
// ])

const response = await chain.invoke({
    question,
    conversation_history
})

  res.status(200).json({ response })
}