import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import useGroupStore from "../store/groupStore";
import Sidebar from "../Components/Sidebar";
import NoChatSelected from "../Components/NoChatSelected";
import ChatContainer from "../Components/ChatContainer";
import GroupChatContainer from "../Components/Groups/GroupChat";

const HomePage = () => {
  const { selectedUser, setSelectedUser,selectedGroup } = useChatStore();
  const {  setSelectedGroup } = useGroupStore();
  const { groupId } = useParams(); // Get groupId from URL
  const navigate = useNavigate();

  // ✅ Sync URL with selected group
  useEffect(() => {
    if (groupId) {
      setSelectedGroup(groupId); // ✅ Just update state, don't navigate
    }
  }, [groupId, setSelectedGroup]);
  

  // ✅ Sync URL with selected user
  useEffect(() => {
    if (selectedUser) {
      // If a user is selected, ensure the URL reflects the DM state
      navigate("/");
    }
  }, [selectedUser, navigate]);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {selectedGroup ? (
              <GroupChatContainer key={selectedGroup._id } /> 
              // ✅ Added key to force re-render when selectedGroup changes
            ) : selectedUser ? (
              <ChatContainer key={selectedUser._id} /> 
              // ✅ Added key for selectedUser to refresh chat properly
            ) : (
              <NoChatSelected />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;