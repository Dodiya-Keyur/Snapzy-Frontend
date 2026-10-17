import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

import App from "./App.jsx";

import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import ActivityPage from "./pages/ActivityPage.jsx";
import SavedPost from "./pages/SavedPost.jsx";
import LikedPost from "./pages/LikedPost.jsx";
import SettingPage from "./pages/SettingPage.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import AccountInformation from "./pages/AccountInformation.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import EditPost from "./pages/EditPost.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";

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
            path: "profile/:userId",
            element: <ProfilePage />,
          },
          {
            path: "edit-profile",
            element: <EditProfile />,
          },
          {
            path: "profile/edit",
            element: <EditProfile />,
          },
          {
            path: "create-post",
            element: <CreatePost />,
          },
          {
            path: "edit-post/:postId",
            element: <EditPost />,
          },
          {
            path: "post/edit/:postId",
            element: <EditPost />,
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
            path: "liked",
            element: <LikedPost />,
          },
          {
            path: "likes",
            element: <LikedPost />,
          },
          {
            path: "setting",
            element: <SettingPage />,
          },
          {
            path: "setting/change-password",
            element: <ChangePassword />,
          },
          {
            path: "change-password",
            element: <ChangePassword />,
          },
          {
            path: "setting/account-info",
            element: <AccountInformation />,
          },
          {
            path: "account-info",
            element: <AccountInformation />,
          },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
);
