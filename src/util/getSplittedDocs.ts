import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const getSplittedDocs = async ({
    filePath,
    chunkSize,
    chunkOverlap,
}: {
    filePath: string;
    chunkSize: number;
    chunkOverlap: number;
})=> {
    const loader = new TextLoader(filePath);
    const rawDocs = await loader.load();

    console.log('file text splitting\n');

    // 텍스트 분할객체 설정
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators: ['\n\n', '\n', '. ', '? ', '! ', '.\n', '?\n', '!\n']
    })

    // 텍스트 분할
    const docs = await textSplitter.splitDocuments(rawDocs);
    return docs
}