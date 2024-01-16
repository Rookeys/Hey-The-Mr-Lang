import type { NextPage } from 'next';
import { useContext, useRef, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types/chat';
import Image from 'next/image';
import { Context } from '../context/ContextProvider';

const Home: NextPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { messageState, setMessageState } = useContext(Context)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputRef.current) {
      const question = inputRef.current.value;
      const history = messageState.history;
      setMessageState((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            type: 'userMessage',
            message: question,
          },
        ],
      }));

      const response = await axios({
          method: 'post',
          url: '/api/customData',
          data : {
            question,
            history,
          }
        })
        .then((res) => res.data);
      setMessageState((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            type: 'apiMessage',
            message: response.message,
          },
        ],
        history: [...state.history, [question, response.message]],
      }));
    }
  };


  return (
    <>
      <div className='flex flex-col gap-4 bg-white text-black'>
        {messageState.messages.map((message, index: number) => {
            let icon;
            if(message.type === 'apiMessage') {
              icon = <Image 
                src={'/chicken.png'}
                alt={'chicken'}
                width={30}
                height={30}
              />
            } else {
              icon = <Image 
                src={'/user.png'}
                alt={'chicken'}
                width={30}
                height={30}
              />
            }
          return(
            <div key={index} className='flex gap-4'>
              {icon}
              <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>{message.message}</ReactMarkdown>
            </div>
          ) 
        }
        )}
      </div>

      <div className="flex flex-col items-start gap-4 p-5 w-25">
        <form onSubmit={handleSubmit}>
          <input ref={inputRef} type="text" />
          <button className="bg-blue-300" type="submit">
            submit
          </button>
        </form>
      </div>
    </>
  );
};

export default Home;
