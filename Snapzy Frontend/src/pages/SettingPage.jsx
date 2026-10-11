import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Shield,
  Moon,
  Eye,
  MessageCircle,
  Heart,
  UserPlus,
  LogOut,
  Trash2,
  ChevronRight,
  Settings as SettingsIcon,
} from "lucide-react";

function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [activityStatus, setActivityStatus] = useState(true);

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    replies: true,
  });

  const toggleNotification = (type) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
              <SettingsIcon size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Settings
              </h1>

              <p className="text-sm text-gray-500">
                Manage your Snapzy account and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">

          {/* Account */}
          <SettingsSection
            title="Account"
            description="Manage your personal account information"
          >
            <SettingsItem
              icon={<User size={20} />}
              title="Edit Profile"
              description="Update your profile picture, bio and personal information"
              onClick={() => console.log("Edit Profile")}
            />

            <SettingsItem
              icon={<User size={20} />}
              title="Account Information"
              description="View and manage your account details"
              onClick={() => console.log("Account Information")}
            />

            <SettingsItem
              icon={<Lock size={20} />}
              title="Change Password"
              description="Update your account password"
              onClick={() => console.log("Change Password")}
            />
          </SettingsSection>

          {/* Privacy */}
          <SettingsSection
            title="Privacy"
            description="Control who can interact with your account"
          >
            <ToggleItem
              icon={<Shield size={20} />}
              title="Private Account"
              description="Only approved followers can see your posts"
              enabled={privateAccount}
              onChange={() =>
                setPrivateAccount(!privateAccount)
              }
            />

            <ToggleItem
              icon={<Eye size={20} />}
              title="Activity Status"
              description="Allow others to see when you are active"
              enabled={activityStatus}
              onChange={() =>
                setActivityStatus(!activityStatus)
              }
            />

            <SettingsItem
              icon={<MessageCircle size={20} />}
              title="Comments"
              description="Manage who can comment on your posts"
              onClick={() => console.log("Comments")}
            />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            title="Notifications"
            description="Choose what notifications you receive"
          >
            <ToggleItem
              icon={<Heart size={20} />}
              title="Likes"
              description="Get notified when someone likes your post"
              enabled={notifications.likes}
              onChange={() =>
                toggleNotification("likes")
              }
            />

            <ToggleItem
              icon={<MessageCircle size={20} />}
              title="Comments"
              description="Get notified when someone comments on your post"
              enabled={notifications.comments}
              onChange={() =>
                toggleNotification("comments")
              }
            />

            <ToggleItem
              icon={<UserPlus size={20} />}
              title="New Followers"
              description="Get notified when someone follows you"
              enabled={notifications.follows}
              onChange={() =>
                toggleNotification("follows")
              }
            />

            <ToggleItem
              icon={<MessageCircle size={20} />}
              title="Comment Replies"
              description="Get notified when someone replies to your comment"
              enabled={notifications.replies}
              onChange={() =>
                toggleNotification("replies")
              }
            />
          </SettingsSection>

          {/* Appearance */}
          <SettingsSection
            title="Appearance"
            description="Customize how Snapzy looks"
          >
            <ToggleItem
              icon={<Moon size={20} />}
              title="Dark Mode"
              description="Use a darker appearance throughout Snapzy"
              enabled={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />

            <SettingsItem
              icon={<Moon size={20} />}
              title="Theme"
              description="Choose your preferred application theme"
              onClick={() => console.log("Theme")}
            />
          </SettingsSection>

          {/* Security */}
          <SettingsSection
            title="Security"
            description="Protect your Snapzy account"
          >
            <SettingsItem
              icon={<Lock size={20} />}
              title="Password & Security"
              description="Manage your password and security settings"
              onClick={() =>
                console.log("Password & Security")
              }
            />

            <SettingsItem
              icon={<Shield size={20} />}
              title="Login Activity"
              description="View devices where your account is logged in"
              onClick={() =>
                console.log("Login Activity")
              }
            />
          </SettingsSection>

          {/* Logout */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <button
              onClick={() => console.log("Logout")}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                <LogOut size={20} />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  Log Out
                </p>

                <p className="text-sm text-gray-500">
                  Sign out from your Snapzy account
                </p>
              </div>

              <ChevronRight
                size={20}
                className="text-gray-400"
              />
            </button>
          </div>

          {/* Danger Zone */}
          <div className="overflow-hidden rounded-2xl border border-red-200 bg-white">
            <div className="border-b border-red-100 px-5 py-4">
              <h2 className="font-bold text-red-600">
                Danger Zone
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                These actions can permanently affect your
                account.
              </p>
            </div>

            <button
              onClick={() => console.log("Delete Account")}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-red-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Trash2 size={20} />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-red-600">
                  Delete Account
                </p>

                <p className="text-sm text-gray-500">
                  Permanently delete your Snapzy account
                  and data
                </p>
              </div>

              <ChevronRight
                size={20}
                className="text-red-400"
              />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Settings Section
----------------------------- */

function SettingsSection({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {children}
      </div>
    </section>
  );
}

/* -----------------------------
   Clickable Settings Item
----------------------------- */

function SettingsItem({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-gray-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">
          {title}
        </p>

        <p className="mt-0.5 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <ChevronRight
        size={20}
        className="shrink-0 text-gray-400"
      />
    </button>
  );
}

/* -----------------------------
   Toggle Settings Item
----------------------------- */

function ToggleItem({
  icon,
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">
          {title}
        </p>

        <p className="mt-0.5 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled
          ? "bg-black"
          : "bg-gray-300"
          }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${enabled
            ? "left-6"
            : "left-1"
            }`}
        />
      </button>
    </div>
  );
}

export default SettingsPage;