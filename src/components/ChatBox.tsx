import { Message } from '@/types/chat';
import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ChickenChatIcon from './svg/ChickenChatIcon';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, what can I help you ?',
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();
    if(!textAreaRef.current) return;

    const question = textAreaRef.current.value.trim();

    setError(null);

    if (!textAreaRef.current?.value) {
      alert('Please input a question');
      return;
    }

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

    setLoading(true);
    textAreaRef.current.value = '';
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
      });
      const data = await response.json();
      

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }
      console.log('messageState', messageState);

      setLoading(false);

      //scroll to bottom
      console.log(messageListRef.current);
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Dialog
            static
            key={'modal'}
            initial={{ opacity: 0, x: '150%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '150%' }}
            as={motion.div}
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="fixed bottom-2 right-0 md:right-2 transition-all  bg-white w-full md:w-1/3 h-[400px] z-999 rounded-lg"
          >
            <Dialog.Panel className="p-4 flex flex-col justify-between gap-2 w-full h-full">
              <Dialog.Title className="text-[#A4907C] text-xl font-bold">
                Jetaime Chicken
              </Dialog.Title>
              <div
                ref={messageListRef}
                className="flex flex-col gap-4 p-2 w-full h-full transition-all duration-300 bg-white overflow-auto rounded-md border-2 border-gray-200 text-black"
              >
                {messages.map((message, index) => {
                  let icon;
                  if (message.type === 'apiMessage') {
                    icon = (
                      <Image
                        key={index}
                        src="/botIcon.png"
                        alt="AI"
                        width="30"
                        height="30"
                        priority
                      />
                    );
                  } else {
                    icon = (
                      <Image
                        key={index}
                        src="/userIcon.png"
                        alt="Me"
                        width="30"
                        height="30"
                        priority
                      />
                    );
                  }
                  return (
                      <div key={`chatMessage-${index}`} className={`flex ${message.type === 'apiMessage' ? '' : 'flex-row-reverse'} items-center`}>
                        {icon}
                        <div>
                          <ReactMarkdown linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  ref={textAreaRef}
                  className=" w-full rounded-md border-2 border-gray-400 px-2 text-black"
                />
                <button type="submit" hidden></button>
              </form>
            </Dialog.Panel>
          </Dialog>
        )}
      </AnimatePresence>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-2 right-2 w-10 h-10 rounded-full bg-white hover:bg-amber-900 animate-bounce duration-300"
        >
          <ChickenChatIcon w={40} h={40} />
        </button>
      )}
    </>
  );
};

export default ChatBot;
