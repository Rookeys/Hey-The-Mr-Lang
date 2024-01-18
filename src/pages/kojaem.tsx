import axios from 'axios'
import React from 'react' 

const Kojaem = () => {
  const supabase = async() => {
    await axios.get("/api/supabase");
  }

  const promptTemplate = async() => {
    await axios.get("/api/promptTemplate")
  }

  const firstChain = async () => {
    await axios.get("/api/firstChain");
  };
  
  return (
    <div className="w-full h-full flex flex-col gap-4 items-center">
      <div className="border border-blue-400 w-fit p-2 rounded-full">
        <button onClick={supabase}>{`context -> supabase 버튼`}</button>
      </div>
      <div className="border border-blue-400 w-fit p-2 rounded-full">
        <button onClick={promptTemplate}>{`promptTemplate 버튼`}</button>
      </div>
      <div className="border border-blue-400 w-fit p-2 rounded-full">
        <button onClick={firstChain}>{`firstChain 버튼`}</button>
      </div>
    </div>
  );
}

export default Kojaem;