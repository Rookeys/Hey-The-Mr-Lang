import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { NextApiRequest, NextApiResponse } from 'next';

// 사용자가 질문한 내용 독립형 질문으로 만들기 (promptTemplate 활용)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    const openAIApiKey = process.env.OPENAI_API_KEY
    const llm = new ChatOpenAI({ openAIApiKey })
    
    const standaloneQuestionTemplate = 'Given a question, convert it to a standalone question. question: {question} standalone question:'

    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

    const standaloneQuestionChain = standaloneQuestionPrompt.pipe(llm)


    const response = await standaloneQuestionChain.invoke({
      question: 'What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful'
    })

    console.log('response', response)

  } catch (error) {
    console.log(error);
  }
}

