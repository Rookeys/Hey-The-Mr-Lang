// 전체적으로 정리된 파일
import { combineDocuments } from "@/utils/combineDocuments";
import { retriever } from "@/utils/retriever";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { NextApiRequest, NextApiResponse } from "next";

// 사용자가 질문한 내용 독립형 질문으로 만들기 (promptTemplate 활용)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { question, history } = req.body;

    //only accept post requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    if (!question) {
      return res.status(400).json({ message: "No question in the request" });
    }

    const openAIApiKey = process.env.OPENAI_API_KEY;
    const llm = new ChatOpenAI({
      openAIApiKey,
      // temperature: 0, // 제공된 데이터 기반으로 사용할건지에 대한 값 (적을수록 제공된 데이터 기반으로 대답 / 높을수록 창의성있게 대답)
    });

    const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
conversation history: {history}
question: {question} 
standalone question:`;

    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
      standaloneQuestionTemplate
    );

    const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about KoJaem based on the context provided and the conversation history. KoJaem is your master. The questioner is someone who is curious about your master, “KoJaem". Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email woalswhwh@gmail.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
context: {context}
conversation history: {history}
question: {question}
answer: `;
    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

    const standaloneQuestionChain = standaloneQuestionPrompt
      .pipe(llm)
      .pipe(new StringOutputParser());

    const retrieverChain = RunnableSequence.from([
      prevResult => prevResult.standalone_question,
      retriever,
      combineDocuments,
    ]);
    const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

    const chain = RunnableSequence.from([
      {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough(),
      },
      {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
        history: ({ original_input }) => original_input.history,
      },
      answerChain,
    ]);

    const response = await chain.invoke({
      question,
      history,
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}
