import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import useGroupStore from "../store/groupStore";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { groups, fetchUserGroups, isLoading, error } = useGroupStore();
  const {setSelectedGroup,selectedGroup} =useChatStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser?._id) {
      fetchUserGroups(authUser._id);
    }
  }, [authUser, fetchUserGroups]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;
  if (isLoading) return <p>Loading groups...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // ✅ Handle Group Click - Sets Zustand State & Navigates
  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    
     // Store full group object in Zustand
    // navigate(`/groups/${group._id}`); // Navigate to dynamic group chat route
  };

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Friends</span>
        </div>

        
      </div>

      {/* ✅ Group List */}
     

      {/* ✅ User List */}
      <div className="overflow-y-auto w-full py-3">
      <h3 className="text-xs font-medium text-gray-500 px-3 mt-4">Groups</h3>
      {groups.length === 0 ? (
          <p className="text-center text-gray-500">No groups available</p>
        ) : (
          groups.map((group) => (
            <button
              key={group._id}
              onClick={() => handleGroupClick(group)}
              className="w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors"
            >
              {group.name}
            </button>
          ))
        )}
        {/* First, map over the groups (if applicable) */}

{/* Then, map over the online users */}
<h3 className="text-xs font-medium text-gray-500 px-3 mt-4">Online Users</h3>
{filteredUsers
  .filter((user) => onlineUsers.includes(user._id)) // ✅ Show only online users
  .map((user) => (
    <button
      key={user._id}
      onClick={() => setSelectedUser(user)}
      className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
        selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
      }`}
    >
      <div className="relative mx-auto lg:mx-0">
        <img
          src={user.profilePic || "/avatar.png"}
          alt={user.name}
          className="size-12 object-cover rounded-full"
        />
        {/* Online status indicator */}
        <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
      </div>
      <div className="hidden lg:block text-left min-w-0">
        <div className="font-medium truncate">{user.fullName}</div>
        <div className="text-sm text-zinc-400">Online</div>
      </div>
    </button>
))}

{/* Finally, map over offline users */}
<h3 className="text-xs font-medium text-gray-500 px-3 mt-4">Offline Users</h3>
{filteredUsers
  .filter((user) => !onlineUsers.includes(user._id)) // ✅ Show only offline users
  .map((user) => (
    <button
      key={user._id}
      onClick={() => setSelectedUser(user)}
      className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
        selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
      }`}
    >
      <div className="relative mx-auto lg:mx-0">
        <img
          src={user.profilePic || "/avatar.png"}
          alt={user.name}
          className="size-12 object-cover rounded-full"
        />
      </div>
      <div className="hidden lg:block text-left min-w-0">
        <div className="font-medium truncate">{user.fullName}</div>
        <div className="text-sm text-zinc-400">Offline</div>
      </div>
    </button>
))}



        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
