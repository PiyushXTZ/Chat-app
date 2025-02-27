import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGroupStore from "../store/groupStore";
import useUserStore from "../store/userStore";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const CreateGroup = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const { createGroup } = useGroupStore();
  const { users, fetchUsers } = useUserStore();
  const { authUser } = useAuthStore();

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = authUser
    ? users
        .filter((u) => u._id !== authUser._id)
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
    : [];

  const handleMemberSelect = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((_id) => _id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
  
    if (!name.trim()) {
      toast.error("Please enter a group name.");
      return;
    }
  
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member.");
      return;
    }
  
    if (!authUser) {
      toast.error("User not authenticated.");
      return;
    }
  
    // Add the logged-in user to the members array and set them as admin
    const groupData = {
      name,
      description,
      members: [...selectedMembers, authUser._id], // Ensure the creator is also a member
      admin: authUser._id, // Set the admin
    };
  
    try {
      const res = await axiosInstance.post("/groups/create", groupData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      const data = await res.data;
  
      if (res.status === 201) {
        toast.success("Group created successfully!");
        navigate(`/`);
      } else {
        toast.error(data.error || "Failed to create group.");
      }
    } catch (error) {
      toast.error("Failed to create group.");
    }
  };
  

  if (!users) return <p className="text-center text-gray-500">Loading users...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-3xl font-semibold mb-6 text-primary text-center">Create a New Group</h2>
        <form onSubmit={handleCreateGroup} className="space-y-6">
          {/* Group Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Group Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter Group Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Group Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Group Description</span>
            </label>
            <textarea
              placeholder="Enter Group Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full"
              rows="3"
            />
          </div>

          {/* Member Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Select Members</span>
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto bg-gray-100 p-4 rounded-lg">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-gray-500">No users available.</p>
              ) : (
                filteredUsers.map((user) => (
                  <label key={user._id} className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-md cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => handleMemberSelect(user._id)}
                    />
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full border border-gray-300">
                        <img src={user.profilePic || "/avatar.png"} alt={user.username} />
                      </div>
                    </div>
                    <span className="text-gray-700 font-medium">{user.fullName}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-full text-lg">
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;