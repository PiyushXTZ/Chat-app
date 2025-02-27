import { useEffect } from "react";
import useGroupStore from "../../store/groupStore";
import { useAuthStore } from "../../store/useAuthStore";

const GroupList = () => {
  const { groups, fetchUserGroups, isLoading, error } = useGroupStore();
  const { authUser } = useAuthStore(); // Get logged-in user

  useEffect(() => {
    if (authUser?._id) {
      fetchUserGroups(authUser._id);
    }
  }, [authUser, fetchUserGroups]);


  if (isLoading) return <p>Loading groups...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold">Your Groups</h2>
      <ul>
        {groups.map((group) => (
          <li key={group._id} className="p-2 border-b">
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
