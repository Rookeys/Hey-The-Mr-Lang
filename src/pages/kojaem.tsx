import axios from 'axios'
import React from 'react' 

const Kojaem = () => {
  const context = async() => {
    await axios.get("/api/langchain");
  }

  const prompt = async() => {
    await axios.get("/api/prompt")
  }
  
  return (
    <div className="w-full h-full flex flex-col gap-4 items-center">
      <div className="border border-blue-400 w-fit p-2 rounded-full">
        <button onClick={context}>{`context -> supabase 버튼`}</button>
      </div>
      <div className="border border-blue-400 w-fit p-2 rounded-full">
        <button onClick={prompt}>{`prompt 버튼`}</button>
      </div>
    </div>
  );
}

export default Kojaem;