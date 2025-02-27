import { useState } from "react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import socket from "../../socket";
import { useAuthStore } from "../../store/useAuthStore";
const MessageInput = ({ groupId }) => {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false); // ✅ Prevent duplicate requests
  const {authUser} = useAuthStore()
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!content.trim() || isSending) return; // ✅ Block multiple clicks

    setIsSending(true); // ✅ Set flag before API call

    try {
      // console.log("🚀 Sending message..."); // Debugging log
      // const res = await axiosInstance.post(
      //   `/messages/send`, // Ensure correct endpoint
      //   {
      //     text: content,
      //     groupId,
      //     messageType: "group",
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${localStorage.getItem("token")}`,
      //     },
      //   }
      // );
      // if (res.status === 201) {
      //   setContent(""); // ✅ Clear input field
      //   console.log("Sending from front end socket");
        
      //   socket.emit("sendGroupMessage", {
      //     groupId,
      //     senderId: res.data.senderId,
      //     text: content,
      //     messageType: "group",
      //   });
      // }
      console.log("🚀 Sending message..."); // Debugging log
  
  // Emit message directly via socket
  socket.emit("sendGroupMessage", {
    groupId,
    senderId: authUser._id, // Use the authenticated user ID
    text: content,
    messageType: "group",
  });

  setContent("");
    } catch (error) {
      toast.error("Failed to send message.");
    } finally {
      setIsSending(false); // ✅ Reset flag after request finishes
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-center p-2 border-t">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-2 border rounded-md"
      />
      <button
        type="submit"
        disabled={isSending} // ✅ Disable button while sending
        className={`ml-2 px-4 py-2 ${isSending ? "bg-gray-400" : "bg-blue-500"} text-white rounded-md`}
      >
        {isSending ? "Sending..." : "Send"}
      </button>
    </form>
  );
};

export default MessageInput;
