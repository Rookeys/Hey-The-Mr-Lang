
import axios from "axios";
import React, { FormEvent, useState } from "react"

const Speech = ({ text, role }: { text: string, role: string }) => 
  <li className={`w-auto p-2 rounded-lg text-sm ${role === 'human' ? 'bg-blue-400 text-white ml-auto rounded-br-none ml-2' : 'bg-green-400 rounded-bl-none mr-2'} mb-2`}>
      {text}
  </li>

function Home() {

const [messages, setMessages] = useState<{text: string, role: string}[]>([]);
const inputRef = React.useRef<HTMLInputElement>(null)
const messageBodyRef = React.useRef<HTMLUListElement>(null)
const [histroy, setHistory] = React.useState<string>('')
const [isLoading, setIsLoading] = useState<boolean>(false)


const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  await progressConversation()
}

async function progressConversation() {
  setIsLoading(true)
  const question = inputRef.current?.value
  if (inputRef.current) {
    inputRef.current.value = '';
  }

  try{
    if(question) {
      setMessages((prevMessages) => [...prevMessages, { text: question, role: 'human' }]);
    
      const res = await axios.post('http://localhost:3000/api/chat', {
        conversation_history: histroy,
        question
      })
    
      setHistory((prevHistory) => prevHistory + `human:` + `${question}` + '\n' + `AI:` + res.data.response + '\n');
      setMessages((prevMessages) => [...prevMessages, {text: res.data.response, role: 'ai'}]);
      
      if (messageBodyRef.current) {
        messageBodyRef.current.scrollTop = messageBodyRef.current.scrollHeight
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    setIsLoading(false)
  }
}

  return (
    <main className="bg-gray-800 bg-cover bg-no-repeat h-screen flex items-center justify-center">
      <section className="bg-blue-100 max-w-[300px] h-auto rounded-lg p-4 flex flex-col justify-center items-center gap-4">
        <ul ref={messageBodyRef} className="bg-white w-full h-[700px] flex flex-col gap-4 overflow-auto py-4">
        {messages.map((message, index) => <Speech key={index} text={message.text} role={message.role} />)}
        </ul>
         <form onSubmit={(e) => handleSubmit(e)} className="flex w-full gap-2">
          <input ref={inputRef} type="text" className="border-[2px] border-grey w-full text-black px-2" />
          <button disabled={isLoading} className="px-4 py-2 bg-blue-200 rounded">submit</button>
        </form>


      </section>
    </main>
  )
}

export default Home
