import { useEffect, useRef } from "react";
import useGroupStore from "../../store/groupStore";
import { useAuthStore } from "../../store/useAuthStore";
import GroupChatHeader from "./chatHeader";
import MessageInput from "./groupMessageInput";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { formatMessageTime } from "../../lib/utils";
import { useChatStore } from "../../store/useChatStore";
const GroupChatContainer = () => {

  const {getGroupMessages,subscribeToMessagesGroup,unsubscribeFromMessagesGroup,setSelectedGroup,selectedGroup,
    messages,
    isMessagesLoading,}= useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // ✅ Fetch messages via Socket.IO when group changes
  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id); // Fetch messages
   
      
      subscribeToMessagesGroup(selectedGroup._id); // Subscribe to updates
    }

    return () => {
      if (selectedGroup?._id) {
        unsubscribeFromMessagesGroup(selectedGroup._id); // Cleanup on unmount
      }
    };
  }, [selectedGroup]);

  // ✅ Scroll to the bottom when messages update
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ Show loading state
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <GroupChatHeader />
        <MessageSkeleton />
        <MessageInput groupId={selectedGroup?._id} />
      </div>
    );
  }

  // ✅ No group selected state
  if (!selectedGroup) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <p className="text-center text-gray-500 p-4">No group selected.</p>
      </div>
    );
  }

  // ✅ Get messages for the selected group
  // const groupMessages = messages[selectedGroup._id] || [];
  // console.log(`Messages for group ${selectedGroup._id}:`, groupMessages);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Chat Header */}
      <GroupChatHeader />

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message?._id || Math.random()} // ✅ Fallback key
              className={`chat ${
                message?.senderId?._id === authUser._id ? "chat-end" : "chat-start"
              }`}
            >
              {/* Sender Avatar */}
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message?.senderId?._id === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : message?.senderId?.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              {/* Sender Name and Timestamp */}
              <div className="chat-header mb-1">
                <span className="font-medium">
                  {message?.senderId?._id === authUser._id ? "You" : message?.senderId?.fullName || "Unknown"}
                </span>
                <time className="text-xs opacity-50 ml-1">
                  {message?.createdAt ? formatMessageTime(message.createdAt) : ""}
                </time>
              </div>

              {/* Message Content */}
              <div className="chat-bubble flex flex-col">
                {message?.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message?.text && <p>{message.text}</p>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet.</p>
        )}

        {/* Scroll anchor */}
        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput groupId={selectedGroup._id} />
    </div>
  );
};

export default GroupChatContainer;
