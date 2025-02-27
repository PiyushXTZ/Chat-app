import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore"; // ✅ Use chat store
import { useAuthStore } from "../../store/useAuthStore";
import GroupChatHeader from "./chatHeader";
import MessageInput from "./groupMessageInput";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { formatMessageTime } from "../../lib/utils";

const GroupChatContainer = () => {
  const {
    messages = [], // ✅ Ensure messages is always an array
    getGroupMessages,
    isMessagesLoading,
    selectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToMessagesGroup,
    unsubscribeFromMessagesGroup,
  } = useChatStore(); // ✅ Use chat store

  console.log("From chatcontainer.jsx");
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
console.log(selectedGroup);
     
  // useEffect(() => {
  //   if (selectedGroup?._id) {
  //     getGroupMessages(selectedGroup._id); // ✅ Fetch messages
  //     subscribeToMessages(); // ✅ Subscribe to real-time updates
  //   }

  //   return () => {
  //     unsubscribeFromMessages(); // ✅ Unsubscribe on unmount
  //   };
  // }, [selectedGroup, getGroupMessages, subscribeToMessages, unsubscribeFromMessages]);
  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id); // ✅ Fetch messages via socket
      subscribeToMessagesGroup(); // ✅ Subscribe to real-time updates
    }
  
    return () => {
      unsubscribeFromMessagesGroup(); // ✅ Unsubscribe on unmount
    };
  }, [selectedGroup, getGroupMessages, subscribeToMessagesGroup, unsubscribeFromMessagesGroup]);
  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <GroupChatHeader />
        <MessageSkeleton />
        <MessageInput groupId={selectedGroup?._id} />
      </div>
    );
  }

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <p className="text-center text-gray-500 p-4">No group selected.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <GroupChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              {/* Sender Avatar */}
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : message.senderId?.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              {/* Message Header */}
              <div className="chat-header mb-1">
                <span className="font-medium">
                  {message.senderId === authUser._id ? "You" : message.senderId?.fullName || "Unknown"}
                </span>
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              {/* Message Content */}
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
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet.</p>
        )}
      </div>

      {/* Message Input */}
      <MessageInput groupId={selectedGroup._id} />
    </div>
  );
};

export default GroupChatContainer;
