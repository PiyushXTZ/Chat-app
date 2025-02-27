import GroupList from "./Components/Groups/fetchUserGroups.jsx";
import Navbar from "./Components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import CreateGroup from "./pages/CreateGroup.jsx";
import GroupChatContainer from "./Components/Groups/GroupChat.jsx"; // Import GroupChatContainer
import ErrorBoundary from "./Components/ErrorBoundary";

import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { Toaster } from "react-hot-toast";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/group/create"
          element={
            <ErrorBoundary>
              <CreateGroup />
            </ErrorBoundary>
          }
        />
        <Route
  path="/groups/:groupId" // Use "/groups/:groupId" instead of "/group/:groupId"
  element={
    <ErrorBoundary>
      {authUser ? <GroupChatContainer /> : <Navigate to="/login" />}
    </ErrorBoundary>
  }
/>
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/testing" element={<GroupList />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;