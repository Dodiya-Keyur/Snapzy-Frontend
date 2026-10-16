import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Heart,
    MessageCircle,
    Reply,
    UserPlus,
    CheckCheck,
    BellOff,
    Trash2,
    MoreHorizontal,
    RefreshCw,
    User,
    AlertCircle,
    Check,
} from "lucide-react";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";

// Fallback images
const DEFAULT_AVATAR =
    "https://i.pinimg.com/474x/64/99/f8/6499f89b3bd815780d60f2cbc210b2bd.jpg";

const tabs = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "like", label: "Likes" },
    { key: "comment", label: "Comments" },
    { key: "follow", label: "Follows" },
];

const typeIcons = {
    like: Heart,
    comment: MessageCircle,
    reply: Reply,
    follow: UserPlus,
};

const typeStyles = {
    like: "bg-rose-500 text-white",
    comment: "bg-sky-500 text-white",
    reply: "bg-violet-500 text-white",
    follow: "bg-emerald-500 text-white",
};

const emptyMessages = {
    all: {
        title: "You're all caught up",
        description: "New likes, comments, replies, and followers will show up here.",
    },
    unread: {
        title: "Nothing unread",
        description: "You've seen everything! New updates will appear here.",
    },
    like: {
        title: "No likes yet",
        description: "When someone likes one of your posts, you'll see it here.",
    },
    comment: {
        title: "No comments yet",
        description: "Comments and replies on your posts will appear here.",
    },
    follow: {
        title: "No new followers",
        description: "When people start following you, you'll see them here.",
    },
};

// Formats relative time (e.g. 2m, 1h, 3d, 1w)
function formatTimeAgo(dateInput) {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y`;
}

function TypeBadge({ type }) {
    const Icon = typeIcons[type] || Heart;
    const styleClass = typeStyles[type] || "bg-zinc-700 text-white";

    return (
        <span
            className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-xs ${styleClass}`}
        >
            <Icon
                size={11}
                strokeWidth={2.5}
                fill={type === "like" ? "currentColor" : "none"}
            />
        </span>
    );
}

function NotificationSkeleton() {
    return (
        <div className="divide-y divide-zinc-100">
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="flex items-center gap-3.5 px-4 py-4 sm:px-5 animate-pulse"
                >
                    <div className="h-11 w-11 shrink-0 rounded-full bg-zinc-200" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3.5 w-44 rounded-md bg-zinc-200" />
                        <div className="h-3 w-28 rounded-md bg-zinc-150" />
                    </div>
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-200" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ tab }) {
    const message = emptyMessages[tab] || emptyMessages.all;

    return (
        <div className="flex flex-col items-center px-6 py-16 text-center sm:py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                <BellOff size={28} strokeWidth={1.75} />
            </div>

            <h2 className="text-base font-semibold text-zinc-900">
                {message.title}
            </h2>

            <p className="mt-1.5 max-w-xs text-sm text-zinc-500">
                {message.description}
            </p>
        </div>
    );
}

function NotificationsPage() {
    const navigate = useNavigate();
    const {
        unreadCount: contextUnreadCount,
        setUnreadCount,
        markAllAsRead: contextMarkAllAsRead,
        deleteNotificationApi,
        deleteAllNotificationsApi,
    } = useNotification();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState("all");
    const [followingIds, setFollowingIds] = useState(new Set());
    const [followLoadingIds, setFollowLoadingIds] = useState(new Set());

    const [openMenuId, setOpenMenuId] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const menuRef = useRef(null);
    const toastTimerRef = useRef(null);

    // Show temporary feedback toast
    const showToast = useCallback((msg) => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }
        setToastMessage(msg);
        toastTimerRef.current = setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    }, []);

    // Close dropdown menu when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenuId(null);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setOpenMenuId(null);
                setShowDeleteAllModal(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Fetch user following list to initialize follow states
    const fetchFollowingList = useCallback(async () => {
        try {
            const res = await api.get("/users/me/following");
            const followingArr = res.data?.following || [];
            const ids = new Set(
                followingArr
                    .map((item) => item.following?._id || item.following)
                    .filter(Boolean)
            );
            setFollowingIds(ids);
        } catch {
            // Silently ignore if following list cannot be loaded
        }
    }, []);

    // Fetch all notifications from backend and auto-mark as read on page open
    const fetchNotifications = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }
                setError(null);

                const response = await api.get("/noti/notifications");
                const items = response.data?.notifications || [];
                const safeItems = Array.isArray(items) ? items : [];

                const unreadCountInDb = safeItems.filter((n) => !n.isRead).length;

                // When user opens the page, auto-mark all notifications as read
                if (unreadCountInDb > 0) {
                    try {
                        await api.patch("/noti/notifications/read-all");
                        setUnreadCount(0);
                        window.dispatchEvent(
                            new CustomEvent("snapzy:notifications-changed")
                        );
                        // Mark all as read in UI state as well
                        setNotifications(
                            safeItems.map((item) => ({ ...item, isRead: true }))
                        );
                    } catch {
                        // Fallback: still show items
                        setNotifications(safeItems);
                        setUnreadCount(unreadCountInDb);
                    }
                } else {
                    setNotifications(safeItems);
                    setUnreadCount(0);
                }
            } catch (err) {
                console.error("Failed to load notifications:", err);
                setError(
                    err.response?.data?.message ||
                        "Unable to load notifications. Please check your connection."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [setUnreadCount]
    );

    // Initial load
    useEffect(() => {
        fetchNotifications();
        fetchFollowingList();
    }, [fetchNotifications, fetchFollowingList]);

    // Listen to follow events from other components (PostCard, SearchPage, etc.)
    useEffect(() => {
        const handleFollowChanged = (e) => {
            const { userId, isFollowing } = e.detail || {};
            if (!userId) return;

            setFollowingIds((prev) => {
                const next = new Set(prev);
                if (isFollowing) {
                    next.add(userId);
                } else {
                    next.delete(userId);
                }
                return next;
            });
        };

        window.addEventListener("snapzy:follow-changed", handleFollowChanged);
        return () => {
            window.removeEventListener("snapzy:follow-changed", handleFollowChanged);
        };
    }, []);

    // Computed unread count from current list
    const unreadCount = notifications.filter((item) => !item.isRead).length;

    // Filter notifications according to active tab
    const filteredNotifications = notifications.filter((item) => {
        if (activeTab === "unread") return !item.isRead;
        if (activeTab === "like") return item.type === "like";
        if (activeTab === "comment") {
            return item.type === "comment" || item.type === "reply";
        }
        if (activeTab === "follow") return item.type === "follow";
        return true;
    });

    // Mark all notifications as read manually
    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0 || actionLoading) return;

        try {
            setActionLoading(true);
            await contextMarkAllAsRead();
            setNotifications((prev) =>
                prev.map((item) => ({ ...item, isRead: true }))
            );
            showToast("All notifications marked as read");
        } catch {
            showToast("Failed to mark notifications as read");
        } finally {
            setActionLoading(false);
        }
    };

    // Delete single notification
    const handleDeleteNotification = async (id, e) => {
        if (e) e.stopPropagation();
        setOpenMenuId(null);

        const target = notifications.find((n) => n._id === id);
        const wasUnread = target && !target.isRead;

        // Optimistic removal
        setNotifications((prev) => prev.filter((n) => n._id !== id));

        try {
            await deleteNotificationApi(id, wasUnread);
            showToast("Notification deleted");
        } catch {
            showToast("Failed to delete notification");
            fetchNotifications(true);
        }
    };

    // Delete all notifications
    const handleDeleteAll = async () => {
        setShowDeleteAllModal(false);
        if (notifications.length === 0 || actionLoading) return;

        try {
            setActionLoading(true);
            setNotifications([]);
            await deleteAllNotificationsApi();
            showToast("All notifications deleted");
        } catch {
            showToast("Failed to delete all notifications");
            fetchNotifications(true);
        } finally {
            setActionLoading(false);
        }
    };

    // Follow / Unfollow user
    const handleToggleFollow = async (userId, e) => {
        if (e) e.stopPropagation();
        if (!userId || followLoadingIds.has(userId)) return;

        const isCurrentlyFollowing = followingIds.has(userId);

        // Optimistic update
        setFollowingIds((prev) => {
            const next = new Set(prev);
            if (isCurrentlyFollowing) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });

        setFollowLoadingIds((prev) => new Set(prev).add(userId));

        window.dispatchEvent(
            new CustomEvent("snapzy:follow-changed", {
                detail: { userId, isFollowing: !isCurrentlyFollowing },
            })
        );

        try {
            if (isCurrentlyFollowing) {
                await api.delete(`/follows/unfollow/${userId}`);
            } else {
                await api.post(`/follows/follow/${userId}`);
            }
        } catch (err) {
            console.warn("Follow action error:", err);
            // Revert state on error
            setFollowingIds((prev) => {
                const next = new Set(prev);
                if (isCurrentlyFollowing) {
                    next.add(userId);
                } else {
                    next.delete(userId);
                }
                return next;
            });
            window.dispatchEvent(
                new CustomEvent("snapzy:follow-changed", {
                    detail: { userId, isFollowing: isCurrentlyFollowing },
                })
            );
        } finally {
            setFollowLoadingIds((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    // Clicking notification row navigates to relevant profile
    const handleRowClick = (item) => {
        if (item.sender?._id) {
            navigate(`/profile/${item.sender._id}`);
        }
    };

    // Action text generator
    const getActionText = (item) => {
        switch (item.type) {
            case "like":
                return "liked your post";
            case "comment":
                return "commented on your post";
            case "reply":
                return "replied to your comment";
            case "follow":
                return "started following you";
            default:
                return "interacted with you";
        }
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-neutral-50/60 pb-16 pt-2 md:py-6">
            <div className="mx-auto max-w-2xl px-3 sm:px-6">
                {/* Main Card Container without overflow-hidden so popups are never clipped */}
                <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs">
                    {/* Header */}
                    <header className="sticky top-0 z-20 rounded-t-2xl border-b border-zinc-100 bg-white/95 backdrop-blur-md">
                        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4 sm:px-6">
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                                    Notifications
                                </h1>

                                {unreadCount > 0 && (
                                    <span className="flex h-5 items-center justify-center rounded-full bg-sky-500 px-2 text-xs font-bold text-white shadow-xs shadow-sky-500/20">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </div>

                            {/* Header Actions */}
                            <div className="flex items-center gap-1 sm:gap-1.5">
                                {/* Refresh button */}
                                <button
                                    type="button"
                                    onClick={() => fetchNotifications(true)}
                                    disabled={refreshing || loading}
                                    title="Refresh notifications"
                                    aria-label="Refresh notifications"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-40 active:scale-95"
                                >
                                    <RefreshCw
                                        size={17}
                                        className={refreshing ? "animate-spin text-sky-600" : ""}
                                    />
                                </button>

                                {/* Delete all / Clear all button */}
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteAllModal(true)}
                                    disabled={notifications.length === 0 || actionLoading}
                                    title="Clear all notifications"
                                    aria-label="Clear all notifications"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 active:scale-95"
                                >
                                    <Trash2 size={17} />
                                </button>

                                {/* Mark all as read button */}
                                <button
                                    type="button"
                                    onClick={handleMarkAllAsRead}
                                    disabled={unreadCount === 0 || actionLoading}
                                    className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent active:scale-95 sm:text-sm"
                                >
                                    <CheckCheck size={18} strokeWidth={2.2} />
                                    <span className="hidden sm:inline">
                                        Mark all read
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <nav
                            className="flex overflow-x-auto px-4 pb-3 sm:px-6 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            aria-label="Notification categories"
                        >
                            {tabs.map((tab) => {
                                const active = activeTab === tab.key;
                                return (    
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 sm:text-sm ${
                                            active
                                                ? "bg-zinc-900 text-white shadow-xs"
                                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                        }`}
                                    >
                                        {tab.label}

                                        {tab.key === "unread" && unreadCount > 0 && (
                                            <span
                                                className={`rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
                                                    active
                                                        ? "bg-white/20 text-white"
                                                        : "bg-sky-100 text-sky-700"
                                                }`}
                                            >
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </header>

                    {/* Content Section */}
                    {loading ? (
                        <NotificationSkeleton />
                    ) : error ? (
                        <div className="flex flex-col items-center px-6 py-14 text-center">
                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                                <AlertCircle size={28} />
                            </div>
                            <h3 className="text-sm font-semibold text-zinc-900">
                                Could not load notifications
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-zinc-500">
                                {error}
                            </p>
                            <button
                                type="button"
                                onClick={() => fetchNotifications(false)}
                                className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
                            >
                                Try again
                            </button>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <EmptyState tab={activeTab} />
                    ) : (
                        <div>
                            {/* Section header */}
                            <div className="flex items-center justify-between bg-zinc-50/75 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6">
                                <span>Recent activity</span>
                                <span className="font-normal text-zinc-400">
                                    {filteredNotifications.length}{" "}
                                    {filteredNotifications.length === 1
                                        ? "notification"
                                        : "notifications"}
                                </span>
                            </div>

                            {/* Notification Rows */}
                            <div className="divide-y divide-zinc-100">
                                {filteredNotifications.map((item, index) => {
                                    const isUnread = !item.isRead;
                                    const sender = item.sender || {};
                                    const senderId = sender._id || sender.id;
                                    const senderName =
                                        sender.username || sender.name || "Someone";
                                    const senderAvatar =
                                        sender.profilePicture ||
                                        sender.avatar ||
                                        DEFAULT_AVATAR;

                                    const isFollowing =
                                        senderId && followingIds.has(senderId);
                                    const isFollowLoading =
                                        senderId && followLoadingIds.has(senderId);

                                    const postImage =
                                        item.post?.image?.url ||
                                        item.post?.imageUrl ||
                                        (typeof item.post?.image === "string"
                                            ? item.post.image
                                            : null);

                                    const commentSnippet =
                                        item.comment?.commentText ||
                                        item.comment?.text ||
                                        null;

                                    const timeAgo = formatTimeAgo(item.createdAt);
                                    const isMenuOpen = openMenuId === item._id;

                                    // Position dropdown popup upwards if it's the last item so it never gets clipped
                                    const isLastItem =
                                        index >= filteredNotifications.length - 1;

                                    return (
                                        <div
                                            key={item._id}
                                            onClick={() => handleRowClick(item)}
                                            className={`group relative flex cursor-pointer items-start gap-3.5 px-4 py-3.5 transition-colors sm:px-6 sm:py-4 ${
                                                isUnread
                                                    ? "bg-sky-50/50 hover:bg-sky-50/80"
                                                    : "bg-white hover:bg-zinc-50/80"
                                            } ${
                                                index === filteredNotifications.length - 1
                                                    ? "rounded-b-2xl"
                                                    : ""
                                            }`}
                                        >
                                            {/* Unread Indicator Bar */}
                                            {isUnread && (
                                                <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-sky-500" />
                                            )}

                                            {/* Sender Avatar with Corner Type Badge */}
                                            <div
                                                className="relative shrink-0 pt-0.5"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (senderId) {
                                                        navigate(`/profile/${senderId}`);
                                                    }
                                                }}
                                            >
                                                <img
                                                    src={senderAvatar}
                                                    alt={senderName}
                                                    onError={(e) => {
                                                        e.currentTarget.src = DEFAULT_AVATAR;
                                                    }}
                                                    className="h-11 w-11 rounded-full bg-zinc-200 object-cover ring-2 ring-white transition-transform group-hover:scale-102 sm:h-12 sm:w-12"
                                                />
                                                <TypeBadge type={item.type} />
                                            </div>

                                            {/* Center Content: Username, action text, time, comment preview */}
                                            <div className="min-w-0 flex-1 pt-0.5">
                                                <p className="text-sm leading-snug text-zinc-700">
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (senderId) {
                                                                navigate(`/profile/${senderId}`);
                                                            }
                                                        }}
                                                        className="font-bold text-zinc-900 transition hover:underline"
                                                    >
                                                        {senderName}
                                                    </span>{" "}
                                                    <span>{getActionText(item)}</span>
                                                    <span className="ml-1.5 whitespace-nowrap text-xs text-zinc-400">
                                                        {timeAgo}
                                                    </span>
                                                </p>

                                                {/* Comment / Reply quote text preview */}
                                                {commentSnippet && (
                                                    <p className="mt-1 line-clamp-2 rounded-lg bg-zinc-100/70 px-2.5 py-1 text-xs text-zinc-600 sm:text-sm">
                                                        "{commentSnippet}"
                                                    </p>
                                                )}

                                                {/* Post caption if no comment preview */}
                                                {!commentSnippet && item.post?.caption && (
                                                    <p className="mt-1 truncate text-xs text-zinc-500">
                                                        {item.post.caption}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Right Section Actions */}
                                            <div
                                                className="flex shrink-0 items-center gap-2 pt-0.5"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Follow / Following Back Button */}
                                                {item.type === "follow" && senderId && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            handleToggleFollow(senderId, e)
                                                        }
                                                        disabled={isFollowLoading}
                                                        className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 sm:px-4 ${
                                                            isFollowing
                                                                ? "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                                                                : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-xs"
                                                        }`}
                                                    >
                                                        {isFollowLoading
                                                            ? "..."
                                                            : isFollowing
                                                            ? "Following"
                                                            : "Follow back"}
                                                    </button>
                                                )}

                                                {/* Post Thumbnail Preview */}
                                                {postImage && (
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (senderId) {
                                                                navigate(`/profile/${senderId}`);
                                                            }
                                                        }}
                                                        className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-100 sm:h-11 sm:w-11"
                                                    >
                                                        <img
                                                            src={postImage}
                                                            alt="Post preview"
                                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                        />
                                                    </div>
                                                )}

                                                {/* Direct Delete Quick Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleDeleteNotification(item._id, e)
                                                    }
                                                    title="Delete notification"
                                                    aria-label="Delete notification"
                                                    className="rounded-full p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                                {/* 3-Dots More Options Menu */}
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        aria-label="More options"
                                                        aria-expanded={isMenuOpen}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId((current) =>
                                                                current === item._id
                                                                    ? null
                                                                    : item._id
                                                            );
                                                        }}
                                                        className={`rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 active:scale-95 ${
                                                            isMenuOpen
                                                                ? "bg-zinc-100 text-zinc-800"
                                                                : ""
                                                        }`}
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>

                                                    {/* Dropdown Menu - Positioned safely above or below */}
                                                    {isMenuOpen && (
                                                        <div
                                                            ref={menuRef}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`absolute right-0 z-50 w-44 rounded-xl border border-zinc-200 bg-white py-1 shadow-xl animate-in fade-in duration-100 ${
                                                                isLastItem
                                                                    ? "bottom-8"
                                                                    : "top-9"
                                                            }`}
                                                        >
                                                            {/* View Profile */}
                                                            {senderId && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenMenuId(null);
                                                                        navigate(
                                                                            `/profile/${senderId}`
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
                                                                >
                                                                    <User size={15} />
                                                                    <span>View profile</span>
                                                                </button>
                                                            )}

                                                            {senderId && (
                                                                <div className="my-1 border-t border-zinc-100" />
                                                            )}

                                                            {/* Delete Notification Option */}
                                                            <button
                                                                type="button"
                                                                onClick={(e) =>
                                                                    handleDeleteNotification(
                                                                        item._id,
                                                                        e
                                                                    )
                                                                }
                                                                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                                                            >
                                                                <Trash2 size={15} />
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal for Clear All Notifications */}
            {showDeleteAllModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150"
                    onClick={() => setShowDeleteAllModal(false)}
                >
                    <div
                        className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl animate-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-zinc-900">
                                    Clear all notifications?
                                </h3>
                                <p className="text-xs text-zinc-500">
                                    This action will permanently delete all your notifications.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowDeleteAllModal(false)}
                                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAll}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 active:scale-95"
                            >
                                Delete all
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Feedback Notification */}
            {toastMessage && (
                <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 md:bottom-8">
                    <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-lg animate-in slide-in-from-bottom-2 duration-150">
                        <Check size={14} className="text-emerald-400" />
                        <span>{toastMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationsPage;
