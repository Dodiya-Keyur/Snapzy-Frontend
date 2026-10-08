import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import Home from './pages/Home.jsx'

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import SearchPage from './pages/SearchPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CreatePost from './pages/CreatePost.jsx'
import ActivityPage from './pages/ActivityPage.jsx'
import SavedPost from './pages/SavedPost.jsx'
import SettingPage from './pages/SettingPage.jsx'
import PageNotFound from './pages/PageNotFound.jsx'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,

    children: [
      // Home Feed
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/notifications",
        element: <NotificationsPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/create-post",
        element: <CreatePost />,
      },
      {
        path: "/activity",
        element: <ActivityPage />,
      },
      {
        path: "/saved",
        element: <SavedPost />,
      },
      {
        path: "/setting",
        element: <SettingPage />,
      },
    ],
  },

  // Login Page
  {
    path: "/login",
    element: <Login />,
  },

  // Register Page
  {
    path: "/register",
    element: <Register />,
  },

  // Page Not Found
  {
    path: "*",
    element: <PageNotFound />,
  },
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
