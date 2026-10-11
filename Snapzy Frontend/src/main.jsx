
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "./index.css";

// Context
import { AuthProvider } from "./context/AuthContext";

// Layout
import App from "./App.jsx";

// Route guards
// import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

// Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import ActivityPage from "./pages/ActivityPage.jsx";
import SavedPost from "./pages/SavedPost.jsx";
import SettingPage from "./pages/SettingPage.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";

// Router configuration

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "search",
            element: <SearchPage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "create-post",
            element: <CreatePost />,
          },
          {
            path: "activity",
            element: <ActivityPage />,
          },
          {
            path: "saved",
            element: <SavedPost />,
          },
          {
            path: "setting",
            element: <SettingPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);


// Render application
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
