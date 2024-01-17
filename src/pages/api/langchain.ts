import fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { NextApiRequest, NextApiResponse } from "next/types";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = fs.readFileSync("src/assets/kojaem-info.txt", "utf-8");
    // const text = await result.text();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      separators: ["\n\n", "\n", " ", ""],
      chunkOverlap: 50,
    });

    const sbApiKey = process.env.SUPABASE_API_KEY;
    const sbUrl = process.env.SUPABASE_URL;
    const openAIApiKey = process.env.OPENAI_API_KEY;

    if (!sbApiKey || !sbUrl) return;
    const client = createClient(sbUrl, sbApiKey);

    const output = await splitter.createDocuments([result]); // 여러 파일을 나누는것도 가능 (배열에 추가하면 됨)
    console.log(output);

    await SupabaseVectorStore.fromDocuments(
      output,
      new OpenAIEmbeddings({ openAIApiKey }),
      {
        client,
        tableName: "documents", // supabase table name
      }
    );

    // console.log(JSON.stringify(output, null, 2)); // [Object] 출력
  } catch (error) {
    console.log(error);
  }
}
