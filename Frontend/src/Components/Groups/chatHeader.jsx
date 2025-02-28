import { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { axiosInstance } from "../../lib/axios";

const GroupChatHeader = () => {
  const { selectedGroup, setSelectedGroup } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [members, setMembers] = useState([]);
  const [groupDescription, setGroupDescription] = useState("");

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (showDropdown && selectedGroup?._id) {
        try {
          const response = await axiosInstance.get(`/groups/${selectedGroup._id}/members`);
          setMembers(response.data.members || []);
          setGroupDescription(response.data.description || "");
        } catch (error) {
          console.error("Failed to fetch group details:", error);
        }
      }
    };

    fetchGroupDetails();
  }, [showDropdown, selectedGroup]);

  return (
    <div className="p-2.5 border-b border-base-300 relative">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {/* Group Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedGroup?.profilePic || "/avatar.png"}
                alt={selectedGroup?.name}
              />
            </div>
          </div>

          {/* Group Info */}
          <div>
            <h3 className="font-medium flex items-center gap-1">
              {selectedGroup?.name} <ChevronDown size={16} />
            </h3>
            <p className="text-sm text-base-content/70">
              {selectedGroup?.members?.length || 0} members
            </p>
          </div>
        </div>

        {/* Close Group Chat Button */}
        <button onClick={() => setSelectedGroup(null)}>
          <X />
        </button>
      </div>

      {/* Dropdown for members */}
      {showDropdown && (
        <div className="absolute left-0 top-12 w-60 bg-white shadow-lg border rounded-md p-2 z-10">
          <div className="flex justify-between items-center mb-1 px-2">
            
            {/* Close Dropdown Button */}
            <button onClick={() => setShowDropdown(false)}>
              <X size={16} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {/* Show Group Description */}
          {groupDescription && (
            <p className="text-sm px-2 text-gray-700 mb-2 italic">Description: {groupDescription}</p>
          )}
          <p className="text-xs text-gray-500">Group Members</p>
          {/* List Members */}
          <ul className="max-h-60 overflow-y-auto">
            {members.length > 0 ? (
              members.map((member) => (
                <li
                  key={member._id}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-md"
                >
                  <img
                    src={member.profilePic || "/avatar.png"}
                    alt={member.fullName}
                    className="size-6 rounded-full"
                  />
                  <span className="text-sm">{member.fullName}</span>
                  {onlineUsers.includes(member._id) && (
                    <span className="w-2 h-2 bg-green-500 rounded-full ml-auto"></span>
                  )}
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500 px-2">No members found</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GroupChatHeader;
