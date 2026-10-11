
import { useState } from "react";
import {
    Heart,
    MessageCircle,
    Reply,
    UserPlus,
    CheckCheck,
    BellOff,
    Trash2,
    Mail,
    MailOpen,
    MoreHorizontal,
} from "lucide-react";

const initialNotifications = [
    {
        id: 1,
        type: "like",
        user: "Rahul Sharma",
        avatar: "https://i.pravatar.cc/150?img=12",
        action: "liked your post",
        time: "2m",
        read: false,
        postImage:
            "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=200",
    },
    {
        id: 2,
        type: "comment",
        user: "Priya Patel",
        avatar: "https://i.pravatar.cc/150?img=32",
        action: "commented on your post",
        preview: "Amazing photo! Where was this taken?",
        time: "15m",
        read: false,
        postImage:
            "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=200",
    },
    {
        id: 3,
        type: "follow",
        user: "Jay Mehta",
        avatar: "https://i.pravatar.cc/150?img=5",
        action: "started following you",
        time: "1h",
        read: false,
    },
    {
        id: 4,
        type: "reply",
        user: "Amit Shah",
        avatar: "https://i.pravatar.cc/150?img=15",
        action: "replied to your comment",
        preview: "Thanks, glad you liked it!",
        time: "3h",
        read: true,
        postImage:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200",
    },
    {
        id: 5,
        type: "like",
        user: "Neha Joshi",
        avatar: "https://i.pravatar.cc/150?img=44",
        action: "liked your post",
        time: "1d",
        read: true,
        postImage:
            "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=200",
    },
    {
        id: 6,
        type: "follow",
        user: "Karan Desai",
        avatar: "https://i.pravatar.cc/150?img=53",
        action: "started following you",
        time: "3d",
        read: true,
    },
    {
        id: 7,
        type: "comment",
        user: "Sneha Iyer",
        avatar: "https://i.pravatar.cc/150?img=47",
        action: "commented on your post",
        preview: "This color grading is unreal.",
        time: "1w",
        read: true,
        postImage:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200",
    },
];

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
    like: "bg-rose-500",
    comment: "bg-sky-500",
    reply: "bg-violet-500",
    follow: "bg-emerald-500",
};

const emptyMessages = {
    all: {
        title: "You're all caught up",
        description: "New likes, comments and followers will show up here.",
    },
    unread: {
        title: "Nothing unread",
        description: "You've seen everything. Nice work.",
    },
    like: {
        title: "No likes yet",
        description: "When someone likes your post, you'll see it here.",
    },
    comment: {
        title: "No comments yet",
        description: "Comments and replies will appear here.",
    },
    follow: {
        title: "No new followers",
        description: "Share your profile to grow your audience.",
    },
};

function TypeBadge({ type }) {
    const Icon = typeIcons[type];

    return (
        <span
            className={`absolute -bottom-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white text-white ${typeStyles[type]}`}
        >
            <Icon
                size={12}
                strokeWidth={2.5}
                fill={type === "like" ? "currentColor" : "none"}
            />
        </span>
    );
}

function EmptyState({ tab }) {
    const message = emptyMessages[tab];

    return (
        <div className="flex flex-col items-center px-6 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                <BellOff size={28} />
            </div>

            <h2 className="text-base font-semibold text-zinc-900">
                {message.title}
            </h2>

            <p className="mt-1 max-w-xs text-sm text-zinc-500">
                {message.description}
            </p>
        </div>
    );
}

function NotificationPage() {
    const [notifications, setNotifications] = useState(
        initialNotifications
    );

    const [activeTab, setActiveTab] = useState("all");
    const [following, setFollowing] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);
    const [mutedUsers, setMutedUsers] = useState([]);

    const unreadCount = notifications.filter(
        (item) => !item.read
    ).length;

    const filteredNotifications = notifications.filter((item) => {
        if (mutedUsers.includes(item.user)) return false;

        if (activeTab === "unread") return !item.read;
        if (activeTab === "like") return item.type === "like";

        if (activeTab === "comment") {
            return item.type === "comment" || item.type === "reply";
        }

        if (activeTab === "follow") return item.type === "follow";

        return true;
    });

    const markAllAsRead = () => {
        setNotifications((previous) =>
            previous.map((item) => ({ ...item, read: true }))
        );
    };

    const markAsRead = (id) => {
        setNotifications((previous) =>
            previous.map((item) =>
                item.id === id ? { ...item, read: true } : item
            )
        );
    };

    const toggleRead = (id) => {
        setNotifications((previous) =>
            previous.map((item) =>
                item.id === id ? { ...item, read: !item.read } : item
            )
        );

        setOpenMenu(null);
    };

    const deleteNotification = (id) => {
        setNotifications((previous) =>
            previous.filter((item) => item.id !== id)
        );

        setOpenMenu(null);
    };

    const muteUser = (name) => {
        setMutedUsers((previous) =>
            previous.includes(name) ? previous : [...previous, name]
        );

        setOpenMenu(null);
    };

    const toggleFollow = (id) => {
        setFollowing((previous) =>
            previous.includes(id)
                ? previous.filter((item) => item !== id)
                : [...previous, id]
        );
    };

    const handleNotificationClick = (id) => {
        markAsRead(id);
        setOpenMenu(null);
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900">
            <div className="mx-auto max-w-2xl sm:px-6 sm:py-8">
                <div className="overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-zinc-200 sm:shadow-sm">

                    {/* Header */}
                    <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/90 backdrop-blur">
                        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-5 sm:px-5">
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-bold tracking-tight">
                                    Notifications
                                </h1>

                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-sky-500 px-2 py-0.5 text-xs font-semibold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-sky-600 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:text-zinc-300"
                            >
                                <CheckCheck size={17} />
                                <span className="hidden sm:inline">
                                    Mark all as read
                                </span>
                            </button>
                        </div>

                        {/* Tabs */}
                        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 sm:px-4">
                            {tabs.map((tab) => {
                                const active = activeTab === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${active
                                            ? "bg-zinc-900 text-white"
                                            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                                            }`}
                                    >
                                        {tab.label}

                                        {tab.key === "unread" && unreadCount > 0 && (
                                            <span
                                                className={`rounded-full px-1.5 text-xs ${active
                                                    ? "bg-white/20"
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

                    {/* Notification list */}
                    {filteredNotifications.length === 0 ? (
                        <EmptyState tab={activeTab} />
                    ) : (
                        <>
                            <h2 className="bg-zinc-50/80 px-4 py-2 text-xs font-semibold text-zinc-500 sm:px-5">
                                Recent activity
                            </h2>

                            <div className="divide-y divide-zinc-100">
                                {filteredNotifications.map((item) => {
                                    const isFollowing = following.includes(item.id);
                                    const menuOpen = openMenu === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleNotificationClick(item.id)}
                                            className={`group relative flex cursor-pointer items-center gap-3 px-3 py-4 transition-colors sm:px-5 ${item.read
                                                ? "hover:bg-zinc-50"
                                                : "bg-sky-50/70 hover:bg-sky-50"
                                                }`}
                                        >
                                            {!item.read && (
                                                <span className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-sky-500" />
                                            )}

                                            {/* Avatar */}
                                            <div className="relative shrink-0">
                                                <img
                                                    src={item.avatar}
                                                    alt={item.user}
                                                    className="h-11 w-11 rounded-full bg-zinc-200 object-cover sm:h-12 sm:w-12"
                                                />

                                                <TypeBadge type={item.type} />
                                            </div>

                                            {/* Notification text */}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm leading-5 text-zinc-600">
                                                    <span className="font-semibold text-zinc-900">
                                                        {item.user}
                                                    </span>{" "}
                                                    {item.action}
                                                    <span className="ml-1.5 text-xs text-zinc-400">
                                                        {item.time}
                                                    </span>
                                                </p>

                                                {item.preview && (
                                                    <p className="mt-1 truncate text-sm text-zinc-500">
                                                        "{item.preview}"
                                                    </p>
                                                )}
                                            </div>

                                            {/* Follow back */}
                                            {item.type === "follow" && (
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleFollow(item.id);
                                                    }}
                                                    className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${isFollowing
                                                        ? "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                                                        : "bg-zinc-900 text-white hover:bg-zinc-700"
                                                        }`}
                                                >
                                                    {isFollowing ? "Following" : "Follow back"}
                                                </button>
                                            )}

                                            {/* Post thumbnail */}
                                            {item.postImage && (
                                                <img
                                                    src={item.postImage}
                                                    alt="Post preview"
                                                    className="h-10 w-10 shrink-0 rounded-lg bg-zinc-200 object-cover sm:h-12 sm:w-12"
                                                />
                                            )}

                                            {/* More options */}
                                            <div className="relative shrink-0">
                                                <button
                                                    aria-label="More options"
                                                    aria-expanded={menuOpen}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setOpenMenu((current) =>
                                                            current === item.id ? null : item.id
                                                        );
                                                    }}
                                                    className={`rounded-full p-2 text-zinc-400 transition hover:bg-zinc-200/70 hover:text-zinc-700 ${menuOpen
                                                        ? "opacity-100"
                                                        : "sm:opacity-0 sm:group-hover:opacity-100"
                                                        }`}
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {menuOpen && (
                                                    <div
                                                        onClick={(event) => event.stopPropagation()}
                                                        className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
                                                    >
                                                        <button
                                                            onClick={() => toggleRead(item.id)}
                                                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                                                        >
                                                            {item.read ? (
                                                                <Mail size={16} />
                                                            ) : (
                                                                <MailOpen size={16} />
                                                            )}

                                                            {item.read
                                                                ? "Mark as unread"
                                                                : "Mark as read"}
                                                        </button>

                                                        <button
                                                            onClick={() => muteUser(item.user)}
                                                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                                                        >
                                                            <BellOff size={16} />
                                                            Mute {item.user.split(" ")[0]}
                                                        </button>

                                                        <button
                                                            onClick={() => deleteNotification(item.id)}
                                                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                                                        >
                                                            <Trash2 size={16} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotificationPage;
