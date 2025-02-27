import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getDirectMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getDirectMessages(selectedUser._id, "dm"); // ✅ Pass type="dm"
      subscribeToMessages();
    }
  
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getDirectMessages, subscribeToMessages, unsubscribeFromMessages]);
  
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isSender = message.senderId?._id === authUser._id;
        const senderName = isSender
          ? "You"
          : message.senderId?.fullName || "Unknown"; // ✅ Ensure fallback name
        
        const senderPic = isSender
          ? authUser.profilePic || "/avatar.png"
          : message.senderId?.profilePic || "/avatar.png"; // ✅ Fallback profile pic

        return (
          <div
            key={message._id}
            className={`chat ${isSender ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img src={senderPic} alt="profile pic" />
              </div>
            </div>
            <div className="chat-header mb-1">
              <span className="font-medium">{senderName}</span>
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        );
      })}

      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
