import { useEffect, useRef, useState } from "react";
import useGroupStore from "../../store/groupStore";
import { useAuthStore } from "../../store/useAuthStore";
import GroupChatHeader from "./chatHeader";
import MessageInput from "./groupMessageInput";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { formatMessageTime } from "../../lib/utils";
import { useChatStore } from "../../store/useChatStore";

const GroupChatContainer = () => {
  const {
    getGroupMessages,
    subscribeToMessagesGroup,
    unsubscribeFromMessagesGroup,
    selectedGroup,
    messages,
    isMessagesLoading,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // ✅ Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // Current match index

  // ✅ Fetch messages via Socket.IO when group changes
  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
      subscribeToMessagesGroup(selectedGroup._id);
    }

    return () => {
      if (selectedGroup?._id) {
        unsubscribeFromMessagesGroup(selectedGroup._id);
      }
    };
  }, [selectedGroup]);

  // ✅ Scroll to the bottom when messages update
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ Filter messages based on search query
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setCurrentIndex(-1);
      return;
    }

    const results = messages
      .map((message, index) =>
        message?.text?.toLowerCase().includes(searchQuery.toLowerCase()) ? index : null
      )
      .filter((index) => index !== null);

    setSearchResults(results);
    setCurrentIndex(results.length > 0 ? 0 : -1); // Start from the first match
  }, [searchQuery, messages]);

  // ✅ Scroll to the currently highlighted message
  useEffect(() => {
    if (currentIndex !== -1 && searchResults.length > 0) {
      const element = document.getElementById(`message-${searchResults[currentIndex]}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentIndex]);

  // ✅ Navigate search results
  const goToNextMatch = () => {
    if (searchResults.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % searchResults.length);
    }
  };

  const goToPreviousMatch = () => {
    if (searchResults.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? searchResults.length - 1 : prevIndex - 1
      );
    }
  };

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

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Chat Header */}
      <GroupChatHeader />

      {/* Search Input & Controls */}
      <div className="p- flex items-center gap-2">
        <input
          type="text"
          placeholder="Search messages..."
          className="w-full p-2 border rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="p-2 bg-gray-300 rounded-md" onClick={() => setSearchQuery("")}>
            ❌
          </button>
        )}
        {searchResults.length > 0 && (
          <>
            <button className="p-2 bg-gray-300 rounded-md" onClick={goToPreviousMatch}>
              ⬆️
            </button>
            <button className="p-2 bg-gray-300 rounded-md" onClick={goToNextMatch}>
              ⬇️
            </button>
          </>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div
              key={message?._id || index}
              id={`message-${index}`}
              className={`chat ${
                message?.senderId?._id === authUser._id ? "chat-end" : "chat-start"
              } ${currentIndex !== -1 && searchResults[currentIndex] === index ? "bg-yellow-200" : ""}`}
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
                {message?.text && (
                  <p>
                    {/* Highlight searched text */}
                    {searchQuery ? (
                      <>
                        {message.text.split(new RegExp(`(${searchQuery})`, "gi")).map((part, i) =>
                          part.toLowerCase() === searchQuery.toLowerCase() ? (
                            <span key={i} className="bg-yellow-300">
                              {part}
                            </span>
                          ) : (
                            part
                          )
                        )}
                      </>
                    ) : (
                      message.text
                    )}
                  </p>
                )}
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
