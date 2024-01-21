import React, { FC, HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
}
export const ChatLoading:FC<Props> = (props) => {
  return (
    <div className={`flex items-center justify-center relative gap-[2px] ${props.className}`}>
      <div
        className="h-2 w-2 bg-gray-400 rounded-full inline-block animate-bubble"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="h-2 w-2 bg-gray-400 rounded-full inline-block animate-bubble"
        style={{ animationDelay: "0.1s" }}
      />
      <div
        className="h-2 w-2 bg-gray-400 rounded-full inline-block animate-bubble"
        style={{ animationDelay: "0.2s" }}
      />
    </div>
  );
}
