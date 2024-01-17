import axios from 'axios'
import React from 'react'

const Kojaem = () => {
  const test = async() => {
    await axios.get("/api/langchain");
  }
  return (
    <div>
      <button onClick={test}>버튼</button>
    </div>
  );
}

export default Kojaem;