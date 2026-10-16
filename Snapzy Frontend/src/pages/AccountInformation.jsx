import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Sparkles,
  Heart,
  Bookmark,
  Users,
  Grid,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const DEFAULT_AVATAR =
  "https://i.pinimg.com/474x/64/99/f8/6499f89b3bd815780d60f2cbc210b2bd.jpg";

function formatDate(dateString) {
  if (!dateString) return "Not available";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Not available";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatTime(dateString) {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function calculateAccountAge(dateString) {
  if (!dateString) return "Recently joined";
  try {
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Joined today";
    if (diffDays === 1) return "Joined yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    }

    const diffYears = Math.floor(diffDays / 365);
    const remMonths = Math.floor((diffDays % 365) / 30);
    if (remMonths > 0) {
      return `${diffYears} year${diffYears > 1 ? "s" : ""}, ${remMonths} mo ago`;
    }
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  } catch {
    return "Recently joined";
  }
}

function AccountInformation() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAccountDetails() {
      try {
        setLoading(true);
        // Try dedicated account-info endpoint first
        try {
          const res = await api.get("/users/me/account-info");
          if (res.data?.account) {
            setAccount(res.data.account);
            return;
          }
        } catch {
          // Fallback to /users/me
        }

        const fallbackRes = await api.get("/users/me");
        const userData = fallbackRes.data?.User || fallbackRes.data?.user || authUser;
        setAccount({
          ...userData,
          stats: {
            followersCount: fallbackRes.data?.followersCount || 0,
            followingCount: fallbackRes.data?.followingCount || 0,
            postsCount: 0,
            savedPostsCount: 0,
            likedPostsCount: 0,
          },
        });
      } catch (err) {
        console.error("Failed to load account information:", err);
        setError("Unable to load full account information. Displaying cached details.");
        if (authUser) {
          setAccount(authUser);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAccountDetails();
  }, [authUser]);

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const username = account?.username || authUser?.username || "user";
  const name = account?.name || authUser?.name || username;
  const email = account?.email || authUser?.email || "Not specified";
  const avatar = account?.profilePicture || authUser?.profilePicture || DEFAULT_AVATAR;
  const bio = account?.bio || authUser?.bio;
  const createdAt = account?.createdAt || authUser?.createdAt;
  const updatedAt = account?.updatedAt || authUser?.updatedAt;
  const userId = account?._id || authUser?._id || "";
  const role = account?.role || authUser?.role || "user";

  const stats = account?.stats || {};
  const isPrivate = Boolean(account?.settings?.privateAccount);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 mt-[-20px] md:mt-0">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Top Back Navigation & Header */}
        <div>
          <Link
            to="/setting"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-black mb-4"
          >
            <ArrowLeft size={18} />
            Back to Settings
          </Link>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white shadow-sm">
              <User size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Account Information
              </h1>
              <p className="text-sm text-gray-500">
                Review your registration details, account creation date, and private information
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-40 rounded-2xl bg-white p-6 shadow-xs border border-gray-200 animate-pulse" />
            <div className="h-64 rounded-2xl bg-white p-6 shadow-xs border border-gray-200 animate-pulse" />
            <div className="h-48 rounded-2xl bg-white p-6 shadow-xs border border-gray-200 animate-pulse" />
          </div>
        ) : (
          <>
            {/* Account Profile Card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-[2px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                    <img
                      src={avatar}
                      alt={username}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
                      className="h-16 w-16 rounded-full object-cover bg-white p-0.5"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900 truncate">
                        {name}
                      </h2>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 shrink-0 text-blue-500 fill-blue-500"
                      >
                        <path d="M12 2l2.4 1.7 2.9-.1 1 2.7 2.4 1.7-.9 2.8.9 2.8-2.4 1.7-1 2.7-2.9-.1L12 22l-2.4-1.7-2.9.1-1-2.7-2.4-1.7.9-2.8-.9-2.8 2.4-1.7 1-2.7 2.9.1L12 2zm-1.2 13.4l5-5-1.4-1.4-3.6 3.6-1.6-1.6-1.4 1.4 3 3z" />
                      </svg>
                    </div>

                    <p className="text-sm font-medium text-gray-500">
                      @{username}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 capitalize">
                        <Shield size={12} className="text-gray-500" />
                        {role === "admin" ? "Administrator" : "Standard Account"}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isPrivate
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        }`}
                      >
                        {isPrivate ? "Private Profile" : "Public Profile"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <Link
                    to="/edit-profile"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95"
                  >
                    Edit Profile
                  </Link>

                  <Link
                    to="/setting/change-password"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 active:scale-95"
                  >
                    <Lock size={13} />
                    Password
                  </Link>
                </div>
              </div>

              {bio && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Bio
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {bio}
                  </p>
                </div>
              )}
            </div>

            {/* 1. Account History & Creation Card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500" />
                  <h2 className="text-base font-bold text-gray-900">
                    Account History & Registration
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Exact registration record and timestamp when your Snapzy account was created
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {/* Date Created */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-2 hover:bg-gray-50/50 transition">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Date Joined / Created
                      </p>
                      <p className="text-xs text-gray-500">
                        When your profile was registered on Snapzy
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right pl-13 sm:pl-0">
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(createdAt)}
                    </p>
                    {formatTime(createdAt) && (
                      <p className="text-xs font-medium text-gray-500">
                        at {formatTime(createdAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Age */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-2 hover:bg-gray-50/50 transition">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Account Longevity
                      </p>
                      <p className="text-xs text-gray-500">
                        Total duration of your active Snapzy journey
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right pl-13 sm:pl-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200/60">
                      <Sparkles size={13} />
                      {calculateAccountAge(createdAt)}
                    </span>
                  </div>
                </div>

                {/* Account User ID */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-2 hover:bg-gray-50/50 transition">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Account Unique ID (UID)
                      </p>
                      <p className="text-xs text-gray-500">
                        Internal database reference identifier
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-13 sm:pl-0">
                    <code className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-mono font-medium text-gray-800">
                      {userId || "Not available"}
                    </code>

                    {userId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(userId, "id")}
                        aria-label="Copy User ID"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition active:scale-95"
                      >
                        {copiedId ? (
                          <Check size={14} className="text-emerald-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Last Profile Update */}
                {updatedAt && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-2 hover:bg-gray-50/50 transition">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Last Profile Update
                        </p>
                        <p className="text-xs text-gray-500">
                          Most recent modification to your profile
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right pl-13 sm:pl-0">
                      <p className="text-xs font-semibold text-gray-700">
                        {formatDate(updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Private & Contact Details Card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <h2 className="text-base font-bold text-gray-900">
                    Private & Personal Contact Details
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Private credentials that are only visible to you and never shared publicly
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {/* Email Address */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3 hover:bg-gray-50/50 transition">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          Registered Email Address
                        </p>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Primary
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Used for account security, recovery and login verification
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-13 sm:pl-0">
                    <span className="text-sm font-semibold text-gray-900 break-all">
                      {email}
                    </span>

                    {email && (
                      <button
                        type="button"
                        onClick={() => handleCopy(email, "email")}
                        aria-label="Copy Email"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition active:scale-95 shrink-0"
                      >
                        {copiedEmail ? (
                          <Check size={14} className="text-emerald-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-2 hover:bg-gray-50/50 transition">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Snapzy Handle
                      </p>
                      <p className="text-xs text-gray-500">
                        Your unique web identification on the platform
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-gray-900 pl-13 sm:pl-0">
                    @{username}
                  </p>
                </div>

                {/* Password Protection */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-2 hover:bg-gray-50/50 transition">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Lock size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Password & Authentication
                      </p>
                      <p className="text-xs text-gray-500">
                        Encrypted with bcrypt (12 rounds salt)
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/setting/change-password"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition pl-13 sm:pl-0"
                  >
                    Change Password
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Account Statistics Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-1">
                Account Engagement & Content
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                Summary of your activity and connections on Snapzy
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-center">
                  <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Grid size={16} />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.postsCount ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Posts</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-center">
                  <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Users size={16} />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.followersCount ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Followers</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-center">
                  <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <Users size={16} />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.followingCount ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Following</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-center">
                  <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                    <Heart size={16} />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.likedPostsCount ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Likes Given</p>
                </div>
              </div>
            </div>

            {/* Privacy Protection Notice Footer */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-xs text-gray-500 flex items-start gap-3">
              <ShieldCheck size={20} className="text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">
                  Data Security & Privacy Promise
                </p>
                <p className="mt-0.5 leading-relaxed">
                  Your private details such as your email address and exact creation timestamps are only viewable by you when logged into your account. Snapzy never sells your personal information to third parties.
                </p>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default AccountInformation;
