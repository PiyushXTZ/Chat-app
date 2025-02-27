import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";
import useGroupStore from "../../store/groupStore";
import socket from "../../socket";

const MessageList = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const { authUser } = useAuthStore();
  const { selectedGroup } = useGroupStore();

  const fetchMessages = async () => {
    try {
      const res = await axiosInstance.get(`/groups/${selectedGroup}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 200) {
        setMessages(res.data.messages);
      }
    } catch (error) {
      toast.error("Failed to load messages.");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedGroup]);

  useEffect(() => {
    socket.emit("joinGroup", groupId);

    socket.on("receiveGroupMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.emit("leaveGroup", groupId);
      socket.off("receiveGroupMessage");
    };
  }, [groupId]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <p className="text-center text-gray-500">No messages yet.</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 my-2 rounded-md ${
              msg.senderId._id === authUser._id
                ? "bg-blue-200 text-right"
                : "bg-gray-200 text-left"
            }`}
          >
            <p className="font-bold">{msg.senderId.username}</p>
            <p>{msg.text}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;