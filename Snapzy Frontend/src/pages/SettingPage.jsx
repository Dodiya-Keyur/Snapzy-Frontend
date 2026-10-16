import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Bell,
  Shield,
  Eye,
  MessageCircle,
  Heart,
  UserPlus,
  LogOut,
  Trash2,
  ChevronRight,
  Settings as SettingsIcon,
  Laptop,
  Check,
  AlertCircle,
  LoaderCircle,
  X,
  ShieldAlert,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function SettingsPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [activityStatus, setActivityStatus] = useState(true);

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    replies: true,
  });

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [showLoginActivityModal, setShowLoginActivityModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Show transient toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  // Load current settings from backend on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get("/users/me/settings");
        if (res.data?.settings) {
          const s = res.data.settings;
          setPrivateAccount(Boolean(s.privateAccount));
          setActivityStatus(
            s.activityStatus !== undefined ? Boolean(s.activityStatus) : true
          );
          if (s.notifications) {
            setNotifications((prev) => ({
              ...prev,
              ...s.notifications,
            }));
          }
        }
      } catch (err) {
        console.warn("Failed to load settings from server, using defaults:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Sync setting toggle to backend API
  const persistSettingChange = async (updatePayload) => {
    try {
      await api.patch("/users/me/settings", updatePayload);
      triggerToast("Settings saved");
    } catch (err) {
      console.error("Failed to update settings:", err);
      triggerToast("Failed to save setting");
    }
  };

  const handleTogglePrivate = () => {
    const nextVal = !privateAccount;
    setPrivateAccount(nextVal);
    persistSettingChange({ privateAccount: nextVal });
  };

  const handleToggleActivity = () => {
    const nextVal = !activityStatus;
    setActivityStatus(nextVal);
    persistSettingChange({ activityStatus: nextVal });
  };

  const toggleNotification = (type) => {
    const nextNotifications = {
      ...notifications,
      [type]: !notifications[type],
    };
    setNotifications(nextNotifications);
    persistSettingChange({ notifications: nextNotifications });
  };

  // Logout via Backend API
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      if (setUser) {
        setUser(null);
      }
      setLogoutLoading(false);
      navigate("/login");
    }
  };

  // Delete Account via Backend API
  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError("");

      await api.delete("/users/me/delete-user");

      localStorage.removeItem("token");
      if (setUser) {
        setUser(null);
      }
      setShowDeleteModal(false);
      navigate("/register");
    } catch (err) {
      console.error("Failed to delete account:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to delete account. Please try again later.";
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 mt-[-20px] md:mt-0">
      <div className="mx-auto max-w-4xl">

        {/* Transient Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white shadow-lg animate-bounce">
            <Check size={14} className="text-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white shadow-sm">
              <SettingsIcon size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Settings
              </h1>

              <p className="text-sm text-gray-500">
                Manage your Snapzy account, security, and privacy preferences
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">

          {/* Account Section */}
          <SettingsSection
            title="Account"
            description="Manage your personal account information and login security"
          >
            <SettingsItem
              icon={<User size={20} />}
              title="Edit Profile"
              description="Update your profile picture, bio, name and username"
              onClick={() => navigate("/edit-profile")}
            />

            <SettingsItem
              icon={<User size={20} />}
              title="Account Information"
              description="View when account was created, private details, email, and statistics"
              onClick={() => navigate("/setting/account-info")}
            />

            <SettingsItem
              icon={<Lock size={20} />}
              title="Change Password"
              description="Update and secure your account password"
              onClick={() => navigate("/setting/change-password")}
            />
          </SettingsSection>

          {/* Privacy Section */}
          <SettingsSection
            title="Privacy"
            description="Control who can interact with your account and view your status"
          >
            <ToggleItem
              icon={<Shield size={20} />}
              title="Private Account"
              description="When private, only approved followers can see your posts and photos"
              enabled={privateAccount}
              onChange={handleTogglePrivate}
            />

            <ToggleItem
              icon={<Eye size={20} />}
              title="Activity Status"
              description="Allow accounts you follow to see when you were last active"
              enabled={activityStatus}
              onChange={handleToggleActivity}
            />

            <SettingsItem
              icon={<MessageCircle size={20} />}
              title="Comments & Interaction"
              description="Manage who can comment on your posts and tag you"
              onClick={() => triggerToast("Comments are currently enabled for all users")}
            />
          </SettingsSection>

          {/* Notifications Section */}
          <SettingsSection
            title="Notifications"
            description="Choose which push and in-app alerts you want to receive"
          >
            <ToggleItem
              icon={<Heart size={20} />}
              title="Likes"
              description="Get notified when someone likes one of your posts"
              enabled={notifications.likes}
              onChange={() => toggleNotification("likes")}
            />

            <ToggleItem
              icon={<MessageCircle size={20} />}
              title="Comments"
              description="Get notified when someone comments on your post"
              enabled={notifications.comments}
              onChange={() => toggleNotification("comments")}
            />

            <ToggleItem
              icon={<UserPlus size={20} />}
              title="New Followers"
              description="Get notified when someone follows your account"
              enabled={notifications.follows}
              onChange={() => toggleNotification("follows")}
            />

            <ToggleItem
              icon={<MessageCircle size={20} />}
              title="Comment Replies"
              description="Get notified when someone replies to your comment"
              enabled={notifications.replies}
              onChange={() => toggleNotification("replies")}
            />
          </SettingsSection>

          {/* Security Section */}
          <SettingsSection
            title="Security"
            description="Protect your Snapzy account and review active sessions"
          >
            <SettingsItem
              icon={<Lock size={20} />}
              title="Password & Security"
              description="Change password, review password strength and authentication"
              onClick={() => navigate("/setting/change-password")}
            />

            <SettingsItem
              icon={<Shield size={20} />}
              title="Login Activity"
              description="View devices where your account is currently logged in"
              onClick={() => setShowLoginActivityModal(true)}
            />
          </SettingsSection>

          {/* Logout Section */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
            <button
              type="button"
              disabled={logoutLoading}
              onClick={handleLogout}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-gray-50 active:scale-[0.99] disabled:opacity-60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                {logoutLoading ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  <LogOut size={20} />
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {logoutLoading ? "Signing Out..." : "Log Out"}
                </p>

                <p className="text-xs text-gray-500">
                  Securely end your current Snapzy session
                </p>
              </div>

              <ChevronRight
                size={20}
                className="text-gray-400 shrink-0"
              />
            </button>
          </div>

          {/* Danger Zone Section */}
          <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-xs">
            <div className="border-b border-red-100 bg-red-50/40 px-5 py-4">
              <h2 className="font-bold text-red-600">
                Danger Zone
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Permanent actions regarding your account data and presence
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-red-50/60 active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Trash2 size={20} />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-red-600">
                  Delete Account
                </p>

                <p className="text-xs text-red-400">
                  Permanently delete your profile, posts, comments, and all associated data
                </p>
              </div>

              <ChevronRight
                size={20}
                className="text-red-400 shrink-0"
              />
            </button>
          </div>

        </div>

      </div>

      {/* ================= LOGIN ACTIVITY MODAL ================= */}
      {showLoginActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Laptop size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Login Activity
                  </h3>
                  <p className="text-xs text-gray-500">
                    Where you are logged in
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLoginActivityModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex items-start justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Laptop size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">
                        Current Web Browser
                      </p>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Now
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {typeof navigator !== "undefined"
                        ? navigator.platform || "Desktop Session"
                        : "Desktop Web"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Authenticated via HTTPOnly Secure Cookie
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-xs text-gray-500">
                <p className="font-semibold text-gray-700 mb-0.5">
                  Didn't recognize an activity?
                </p>
                <p className="leading-relaxed">
                  If you suspect unauthorized access, click below to change your password immediately.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowLoginActivityModal(false);
                  navigate("/setting/change-password");
                }}
                className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
              >
                Change Password
              </button>

              <button
                type="button"
                onClick={() => setShowLoginActivityModal(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE ACCOUNT CONFIRMATION MODAL ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <ShieldAlert size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Delete Snapzy Account?
              </h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              This action is <span className="font-semibold text-red-600">permanent and irreversible</span>. All of your photos, posts, comments, likes, saved bookmarks, and follower connections will be wiped completely from our servers.
            </p>

            {deleteError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
                <AlertCircle size={15} className="shrink-0 text-red-600" />
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAccount}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-red-700 active:scale-95 disabled:opacity-50 shadow-xs"
              >
                {deleteLoading && <LoaderCircle size={14} className="animate-spin" />}
                {deleteLoading ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* -----------------------------
   Settings Section
----------------------------- */

function SettingsSection({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-gray-500">
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
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-gray-50 active:scale-[0.99]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-gray-500 truncate">
          {description}
        </p>
      </div>

      <ChevronRight
        size={18}
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
        <p className="text-sm font-semibold text-gray-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
          enabled ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default SettingsPage;