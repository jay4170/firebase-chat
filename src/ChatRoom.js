import React from "react";

export default function ChatRoom() {
  return (
    <>
      <div>
        {messages && messages.map((msg) => <ChatMessage key={msg.id} />)}
      </div>
    </>
  );
}
