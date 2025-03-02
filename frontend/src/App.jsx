import { Toaster } from "react-hot-toast";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore.js";
import Spinner from "./components/Spinner.jsx"; // Import Loader component
import IndexPage from "./pages/Index.jsx";
import PlayGroundPage from "./pages/PlaygroundPage.jsx";
import AnalyzedFilesPage from "./pages/AnalyzedFilesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

// ✅ Create a ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuthStore();
  return authUser ? children : <Navigate to="/login" />;
};

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []); // Removed dependency on checkAuth to avoid unnecessary re-renders

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        <Route index element={<IndexPage />} />
        <Route path="playground" element={<PlayGroundPage />} />
        {/* ✅ Using ProtectedRoute for better readability */}
        <Route path="dashboard" element={<ProtectedRoute><AnalyzedFilesPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>
    )
  );

  return (
    <>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
      <Toaster />
    </>
  );
}

export default App;
