import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bookmark,
  UserPlus,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  RefreshCw,
  ArrowUpDown,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  User,
  ExternalLink,
} from "lucide-react";
import api from "../api/axios";

// Default fallback avatar
const DEFAULT_AVATAR =
  "https://i.pinimg.com/474x/64/99/f8/6499f89b3bd815780d60f2cbc210b2bd.jpg";

function formatTimeAgo(timestamp) {
  if (!timestamp) return "Recently";
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getDateGroupLabel(timestamp) {
  if (!timestamp) return "Earlier";
  const date = new Date(timestamp);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - itemDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return "This week";
  if (diffDays > 7 && diffDays <= 30) return "This month";

  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function ActivityBadge({ type }) {
  const styles = {
    like: "bg-rose-500 text-white shadow-xs shadow-rose-500/30",
    comment: "bg-sky-500 text-white shadow-xs shadow-sky-500/30",
    save: "bg-amber-500 text-white shadow-xs shadow-amber-500/30",
    follow: "bg-emerald-500 text-white shadow-xs shadow-emerald-500/30",
  };

  const icons = {
    like: <Heart size={11} className="fill-white" />,
    comment: <MessageCircle size={11} className="fill-white" />,
    save: <Bookmark size={11} className="fill-white" />,
    follow: <UserPlus size={11} />,
  };

  return (
    <div
      className={`flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white ${styles[type] || "bg-gray-500 text-white"
        }`}
    >
      {icons[type]}
    </div>
  );
}

function CustomSortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
  ];

  const currentLabel =
    options.find((opt) => opt.value === value)?.label || "Newest first";

  return (
    <div className="relative w-full sm:w-52" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-gray-200/90 bg-white px-4 text-sm font-medium text-gray-700 shadow-2xs transition hover:border-gray-300 hover:bg-gray-50/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 truncate">
          <ArrowUpDown size={15} className="text-gray-400" />
          <span className="truncate">{currentLabel}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-full min-w-[190px] overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition sm:text-sm ${isSelected
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={16} className="text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">

      {/* Rows Skeleton */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xs divide-y divide-gray-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 sm:p-5">
            <div className="h-14 w-14 rounded-2xl bg-gray-200/80 sm:h-16 sm:w-16" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 w-48 rounded bg-gray-200/80" />
              <div className="h-3 w-64 rounded bg-gray-200/60" />
              <div className="h-2.5 w-20 rounded bg-gray-200/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    all: 0,
    like: 0,
    comment: 0,
    save: 0,
    follow: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch activities from backend
  const fetchActivities = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Attempt unified activities API first
      try {
        const response = await api.get("/users/me/activities");
        const data = response.data || {};
        const items = Array.isArray(data.activities) ? data.activities : [];
        setActivities(items);
        if (data.stats) {
          setStats(data.stats);
        } else {
          // Compute locally
          setStats({
            all: items.length,
            like: items.filter((a) => a.type === "like").length,
            comment: items.filter((a) => a.type === "comment").length,
            save: items.filter((a) => a.type === "save").length,
            follow: items.filter((a) => a.type === "follow").length,
          });
        }
      } catch (backendErr) {
        // Fallback: Query all individual endpoints (likes, saved, comments, follows)
        console.warn("Unified activities API failed, falling back to individual routes:", backendErr);
        const [likesRes, savedRes, commentsRes, followingRes] = await Promise.allSettled([
          api.get("/users/me/liked-post"),
          api.get("/users/me/saved-posts"),
          api.get("/comments/me"),
          api.get("/users/me/following"),
        ]);

        const fallbackItems = [];
        const missingUserIds = new Set();

        // 1. Likes
        if (likesRes.status === "fulfilled") {
          const rawLikes =
            likesRes.value.data?.likedPost ||
            likesRes.value.data?.likedPosts ||
            likesRes.value.data?.posts ||
            [];
          rawLikes.forEach((item) => {
            const p = item.post || item;
            if (p) {
              const u = p.user;
              const hasObjUser = u && typeof u === "object" && (u.username || u.name);
              const authorId = typeof u === "object" ? (u._id || u.id) : (typeof u === "string" ? u : null);
              if (!hasObjUser && authorId) {
                missingUserIds.add(authorId.toString());
              }
              fallbackItems.push({
                id: `like_${item._id || p._id}`,
                type: "like",
                createdAt: item.createdAt || p.createdAt,
                postId: p._id,
                postImage: p.image?.url || p.image || p.imageUrl,
                caption: p.caption || "",
                username: hasObjUser ? (u.username || u.name) : "",
                avatar: hasObjUser ? (u.profilePicture || DEFAULT_AVATAR) : DEFAULT_AVATAR,
                userId: authorId,
              });
            }
          });
        }

        // 2. Saved Posts
        if (savedRes.status === "fulfilled") {
          const rawSaved =
            savedRes.value.data?.savedPosts ||
            savedRes.value.data?.posts ||
            [];
          rawSaved.forEach((p) => {
            if (p) {
              const u = p.user;
              const hasObjUser = u && typeof u === "object" && (u.username || u.name);
              const authorId = typeof u === "object" ? (u._id || u.id) : (typeof u === "string" ? u : null);
              if (!hasObjUser && authorId) {
                missingUserIds.add(authorId.toString());
              }
              fallbackItems.push({
                id: `save_${p._id}`,
                type: "save",
                createdAt: p.createdAt,
                postId: p._id,
                postImage: p.image?.url || p.image || p.imageUrl,
                caption: p.caption || "",
                username: hasObjUser ? (u.username || u.name) : "",
                avatar: hasObjUser ? (u.profilePicture || DEFAULT_AVATAR) : DEFAULT_AVATAR,
                userId: authorId,
              });
            }
          });
        }

        // 3. Comments
        if (commentsRes.status === "fulfilled") {
          const rawComments =
            commentsRes.value.data?.comments ||
            commentsRes.value.data?.data ||
            [];
          rawComments.forEach((c) => {
            const p = c.post;
            const u = p?.user;
            const hasObjUser = u && typeof u === "object" && (u.username || u.name);
            const authorId = typeof u === "object" ? (u._id || u.id) : (typeof u === "string" ? u : null);
            if (!hasObjUser && authorId) {
              missingUserIds.add(authorId.toString());
            }
            fallbackItems.push({
              id: `comment_${c._id}`,
              type: "comment",
              createdAt: c.createdAt,
              postId: p?._id,
              postImage: p?.image?.url || p?.image || p?.imageUrl,
              caption: p?.caption || "",
              commentText: c.commentText,
              username: hasObjUser ? (u.username || u.name) : "",
              avatar: hasObjUser ? (u.profilePicture || DEFAULT_AVATAR) : DEFAULT_AVATAR,
              userId: authorId,
            });
          });
        }

        // 4. Following
        if (followingRes.status === "fulfilled") {
          const rawFollowing =
            followingRes.value.data?.following ||
            followingRes.value.data?.data ||
            [];
          rawFollowing.forEach((f) => {
            const followed = f.following || f;
            if (followed) {
              const u = followed;
              fallbackItems.push({
                id: `follow_${f._id || u._id}`,
                type: "follow",
                createdAt: f.createdAt || new Date().toISOString(),
                username: u.username || u.name || "user",
                avatar: u.profilePicture || DEFAULT_AVATAR,
                caption: u.name || (u.username ? `@${u.username}` : ""),
                userId: u._id || u.id,
              });
            }
          });
        }

        // Fetch any missing author usernames in parallel
        if (missingUserIds.size > 0) {
          try {
            const userProfiles = await Promise.allSettled(
              Array.from(missingUserIds).map((uid) => api.get(`/users/${uid}`))
            );
            const resolvedUsers = {};
            userProfiles.forEach((res) => {
              if (res.status === "fulfilled") {
                const u = res.value.data?.User || res.value.data?.user || res.value.data;
                if (u && (u._id || u.id)) {
                  resolvedUsers[(u._id || u.id).toString()] = u;
                }
              }
            });

            fallbackItems.forEach((item) => {
              if ((!item.username || item.username === "creator") && item.userId) {
                const found = resolvedUsers[item.userId.toString()];
                if (found) {
                  item.username = found.username || found.name || "user";
                  if (found.profilePicture) item.avatar = found.profilePicture;
                }
              }
            });
          } catch {
            // Ignore error
          }
        }

        fallbackItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setActivities(fallbackItems);
        setStats({
          all: fallbackItems.length,
          like: fallbackItems.filter((a) => a.type === "like").length,
          comment: fallbackItems.filter((a) => a.type === "comment").length,
          save: fallbackItems.filter((a) => a.type === "save").length,
          follow: fallbackItems.filter((a) => a.type === "follow").length,
        });
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load activities. Please check your connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Filter by type
    if (activeFilter !== "all") {
      result = result.filter((item) => item.type === activeFilter);
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((item) => {
        const u = (item.username || "").toLowerCase();
        const c = (item.caption || "").toLowerCase();
        const t = (item.commentText || "").toLowerCase();
        return u.includes(q) || c.includes(q) || t.includes(q);
      });
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sort === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [activities, activeFilter, search, sort]);

  // Group activities by smart date label
  const groupedActivities = useMemo(() => {
    const groups = {};
    for (const item of filteredActivities) {
      const label = getDateGroupLabel(item.createdAt);
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(item);
    }
    return groups;
  }, [filteredActivities]);

  const filterTabs = [
    { id: "all", label: "All activity", count: stats.all || activities.length },
    { id: "like", label: "Likes", count: stats.like || 0 },
    { id: "comment", label: "Comments", count: stats.comment || 0 },
    { id: "save", label: "Saved", count: stats.save || 0 },
    { id: "follow", label: "Follows", count: stats.follow || 0 },
  ];

  // Helper to open post preview
  const handleItemClick = (activity) => {
    if (activity.type === "follow") {
      if (activity.userId) {
        navigate(`/profile/${activity.userId}`);
      }
      return;
    }

    if (activity.postId || activity.postImage) {
      setSelectedPost(activity);
    } else if (activity.userId) {
      navigate(`/profile/${activity.userId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-4 pb-20 sm:px-6 sm:py-8 lg:px-8">

      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Your activity
            </h1>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Everything you've liked, saved, commented on, and followed in one place.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <ActivitySkeleton />
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white px-6 py-14 text-center shadow-2xs">
            <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Could not load activities
            </h3>
            <p className="mt-1 max-w-md text-xs text-gray-500 sm:text-sm">
              {error}
            </p>
            <button
              type="button"
              onClick={() => fetchActivities(false)}
              className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Search + Sort Bar */}
            <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by username, caption or comment..."
                  className="h-12 w-full rounded-2xl border border-gray-200/90 bg-white pl-11 pr-10 text-xs text-gray-900 shadow-2xs outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-sm"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Custom Sort Dropdown */}
              <CustomSortDropdown value={sort} onChange={setSort} />
            </div>

            {/* Filter Tabs with Zero Gray Scrollbar Line */}
            <div
              className="mb-6 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filterTabs.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition active:scale-95 sm:text-sm ${isActive
                        ? "bg-gray-900 text-white shadow-xs"
                        : "border border-gray-200/90 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Activity Feed Container */}
            <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xs">
              {Object.keys(groupedActivities).length > 0 ? (
                Object.entries(groupedActivities).map(([dateLabel, items]) => (
                  <div key={dateLabel}>
                    {/* Date Section Header */}
                    <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-2.5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          {dateLabel}
                        </h2>
                        <span className="text-[11px] font-medium text-gray-400">
                          {items.length} {items.length === 1 ? "activity" : "activities"}
                        </span>
                      </div>
                    </div>

                    {/* Activity Items List */}
                    <div className="divide-y divide-gray-100">
                      {items.map((activity) => {
                        const hasPost = Boolean(activity.postId || activity.postImage);
                        return (
                          <div
                            key={activity.id}
                            onClick={() => handleItemClick(activity)}
                            className="group flex cursor-pointer items-start gap-3.5 p-4 transition-colors hover:bg-gray-50/70 sm:gap-4 sm:p-5"
                          >
                            {/* Left: Thumbnail or Avatar with Badge */}
                            <div className="relative shrink-0">
                              {activity.type === "follow" || !activity.postImage ? (
                                <img
                                  src={activity.avatar || DEFAULT_AVATAR}
                                  alt={activity.username}
                                  className="h-13 w-13 rounded-2xl object-cover ring-1 ring-gray-200/80 sm:h-15 sm:w-15"
                                  onError={(e) => {
                                    e.currentTarget.src = DEFAULT_AVATAR;
                                  }}
                                />
                              ) : (
                                <div className="h-13 w-13 overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-100 sm:h-15 sm:w-15">
                                  <img
                                    src={activity.postImage}
                                    alt={activity.caption || "Post thumbnail"}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}

                              {/* Activity Badge */}
                              <div className="absolute -bottom-1 -right-1">
                                <ActivityBadge type={activity.type} />
                              </div>
                            </div>

                            {/* Middle: Content */}
                            <div className="min-w-0 flex-1 pt-0.5">
                              <p className="text-xs text-gray-800 sm:text-sm">
                                <span className="text-gray-500">You </span>
                                <span className="font-semibold text-gray-900">
                                  {activity.type === "like" && "liked a post by "}
                                  {activity.type === "comment" && "commented on a post by "}
                                  {activity.type === "save" && "saved a post by "}
                                  {activity.type === "follow" && "started following "}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (activity.userId) {
                                      navigate(`/profile/${activity.userId}`);
                                    }
                                  }}
                                  className="font-bold text-gray-900 hover:text-blue-600 hover:underline"
                                >
                                  @{activity.username && activity.username !== "creator" ? activity.username : (activity.name || "user")}
                                </button>
                              </p>

                              {/* Comment Snippet */}
                              {activity.type === "comment" && activity.commentText && (
                                <div className="mt-1.5 rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2 text-xs text-sky-950 sm:text-sm">
                                  <p className="italic">“{activity.commentText}”</p>
                                </div>
                              )}

                              {/* Post Caption Preview */}
                              {activity.caption && activity.type !== "follow" && (
                                <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                                  {activity.caption}
                                </p>
                              )}

                              {/* Followed user details */}
                              {activity.type === "follow" && activity.caption && (
                                <p className="mt-0.5 text-xs text-gray-400">
                                  {activity.caption}
                                </p>
                              )}

                              {/* Time */}
                              <p className="mt-1.5 text-[11px] font-medium text-gray-400">
                                {formatTimeAgo(activity.createdAt)}
                              </p>
                            </div>

                            {/* Right Arrow / Action hint */}
                            <div className="self-center pr-1 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700">
                              <ChevronRight size={18} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                /* Empty State */
                <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    <Sparkles size={24} />
                  </div>

                  <h3 className="text-base font-bold text-gray-900">
                    {search.trim() || activeFilter !== "all"
                      ? "No matching activities found"
                      : "No activity yet"}
                  </h3>

                  <p className="mt-1 max-w-sm text-xs text-gray-500 sm:text-sm">
                    {search.trim() || activeFilter !== "all"
                      ? "Try adjusting your search query or switching to another filter."
                      : "When you like, comment on, save posts, or follow users, your activity will show up here."}
                  </p>

                  {(search.trim() || activeFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setActiveFilter("all");
                      }}
                      className="mt-4 rounded-xl border border-gray-200/90 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-95"
                    >
                      Clear search & filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Selected Post Preview Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedPost.avatar || DEFAULT_AVATAR}
                  alt={selectedPost.username}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPost.userId) {
                        navigate(`/profile/${selectedPost.userId}`);
                      }
                    }}
                    className="text-xs font-bold text-gray-900 hover:text-blue-600 sm:text-sm"
                  >
                    @{selectedPost.username && selectedPost.username !== "creator" ? selectedPost.username : (selectedPost.name || "user")}
                  </button>
                  <p className="text-[11px] text-gray-400">
                    {formatTimeAgo(selectedPost.createdAt)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative aspect-square max-h-[55vh] w-full bg-black flex items-center justify-center overflow-hidden">
              {selectedPost.postImage ? (
                <img
                  src={selectedPost.postImage}
                  alt={selectedPost.caption || "Post preview"}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <ImageIcon size={48} />
                  <span className="text-xs">No image preview available</span>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3">
              {/* Comment text if it was a comment */}
              {selectedPost.type === "comment" && selectedPost.commentText && (
                <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-950 sm:text-sm">
                  <span className="font-semibold text-sky-800">Your comment: </span>
                  <span className="italic">“{selectedPost.commentText}”</span>
                </div>
              )}

              {/* Caption */}
              {selectedPost.caption && (
                <p className="text-xs text-gray-700 sm:text-sm line-clamp-3">
                  <span className="font-semibold text-gray-900">
                    @{selectedPost.username && selectedPost.username !== "creator" ? selectedPost.username : (selectedPost.name || "user")}:{" "}
                  </span>
                  {selectedPost.caption}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {selectedPost.userId && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/profile/${selectedPost.userId}`);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    <span>View author profile</span>
                    <ExternalLink size={13} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="ml-auto rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityPage;