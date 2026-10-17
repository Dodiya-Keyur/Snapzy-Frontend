import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Camera,
    Bell,
    Menu,
    X,
    ArrowLeft,
    Settings,
    Bookmark,
    Heart,
    Activity,
    User,
    PlusSquare,
    LogOut,
    ChevronRight,
    Shield,
    Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import api from "../api/axios";

function MobileHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, setUser } = useAuth();
    const { unreadCount, hasUnread } = useNotification();

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname, location.search]);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
            document.body.classList.add("mobile-menu-open");
        } else {
            document.body.style.overflow = "";
            document.body.classList.remove("mobile-menu-open");
        }
        return () => {
            document.body.style.overflow = "";
            document.body.classList.remove("mobile-menu-open");
        };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout failed:", error);
        }
        localStorage.removeItem("token");
        if (setUser) {
            setUser(null);
        }
        setIsMenuOpen(false);
        navigate("/login");
    };

    const handleNavigate = (path) => {
        setIsMenuOpen(false);
        navigate(path);
    };

    const menuSections = useMemo(
        () => [
            {
                section: "How you use Snapzy",
                items: [
                    {
                        name: "Saved Posts",
                        description: "Posts and collections you saved",
                        path: "/saved",
                        icon: Bookmark,
                        iconColor: "text-amber-500",
                        bgColor: "bg-amber-50",
                    },
                    {
                        name: "Liked Posts",
                        description: "Posts you reacted to and loved",
                        path: "/liked",
                        icon: Heart,
                        iconColor: "text-rose-500",
                        bgColor: "bg-rose-50",
                    },
                    {
                        name: "Your Activity",
                        description: "Likes, comments and history",
                        path: "/activity",
                        icon: Activity,
                        iconColor: "text-blue-500",
                        bgColor: "bg-blue-50",
                    },
                    {
                        name: "Notifications",
                        description: "Recent alerts and mentions",
                        path: "/notifications",
                        icon: Bell,
                        iconColor: "text-purple-500",
                        bgColor: "bg-purple-50",
                        badge: unreadCount > 0 ? `${unreadCount} new` : null,
                    },
                ],
            },
            {
                section: "Account & Preferences",
                items: [
                    {
                        name: "Settings & Privacy",
                        description: "Account, security & preferences",
                        path: "/setting",
                        icon: Settings,
                        iconColor: "text-gray-700",
                        bgColor: "bg-gray-100",
                    },
                    {
                        name: "My Profile",
                        description: "View and edit your profile",
                        path: "/profile",
                        icon: User,
                        iconColor: "text-emerald-500",
                        bgColor: "bg-emerald-50",
                    },
                    {
                        name: "Create Post",
                        description: "Share photos and updates",
                        path: "/create-post",
                        icon: PlusSquare,
                        iconColor: "text-indigo-500",
                        bgColor: "bg-indigo-50",
                    },
                ],
            },
        ],
        [unreadCount]
    );

    const username = user?.username || user?.name || "Keyur";
    const userHandle = user?.username ? `@${user.username}` : "@keyur_dodiya_01";
    const userAvatar =
        user?.avatar ||
        user?.profilePic ||
        user?.profilePhoto ||
        "https://i.pravatar.cc/150?img=12";

    return (
        <>
            <header
                id="mobile-top-header"
                className="fixed left-0 right-0 top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md md:hidden transition-all duration-200"
            >
                <div className="flex h-16 items-center justify-between px-4">
                    <NavLink to="/" className="flex items-center gap-2.5 active:opacity-80">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 shadow-sm shadow-pink-500/20">
                            <Camera
                                size={21}
                                strokeWidth={2.2}
                                className="text-white"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">
                            Snapzy
                        </span>
                    </NavLink>

                    <div className="flex items-center gap-1.5">
                        <NavLink
                            to="/notifications"
                            aria-label="Notifications"
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-800 transition hover:bg-gray-100 active:scale-95"
                        >
                            <Bell
                                size={23}
                                strokeWidth={2}
                                className="text-gray-900"
                            />
                            {hasUnread && (
                                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 animate-pulse" />
                            )}
                        </NavLink>

                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Open menu"
                            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-800 transition hover:bg-gray-100 active:scale-95"
                        >
                            <Menu
                                size={25}
                                strokeWidth={2.2}
                                className="text-gray-900"
                            />
                        </button>
                    </div>
                </div>
            </header>

            {typeof document !== "undefined" &&
                createPortal(
                    <div
                        className={`fixed inset-0 z-[9999] flex h-full w-full flex-col bg-gray-50 md:hidden transition-all duration-300 ease-out ${isMenuOpen
                            ? "translate-y-0 opacity-100 pointer-events-auto"
                            : "translate-y-full opacity-0 pointer-events-none"
                            }`}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Settings and activity full screen menu"
                    >
                        <div className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-xs">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsMenuOpen(false)}
                                    aria-label="Back"
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 active:scale-95"
                                >
                                    <ArrowLeft size={22} strokeWidth={2.2} />
                                </button>
                                <div className="flex items-center gap-2">
                                    <Sparkles size={18} className="text-pink-500" />
                                    <h1 className="text-lg font-bold text-gray-900">
                                        Settings and activity
                                    </h1>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Close"
                                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 active:scale-95"
                            >
                                <X size={21} strokeWidth={2.2} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 pb-16 space-y-5">
                            <div
                                onClick={() => handleNavigate("/profile")}
                                className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs transition hover:bg-gray-50 active:scale-[0.99]"
                            >
                                <div className="flex items-center gap-3.5">
                                    <img
                                        src={userAvatar}
                                        alt={username}
                                        className="h-12 w-12 rounded-full object-cover ring-2 ring-pink-500/20"
                                    />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="font-semibold text-gray-900">
                                                {username}
                                            </p>
                                            <Shield
                                                size={14}
                                                className="text-blue-500 fill-blue-500"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {userHandle} • Snapzy Account
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </div>

                            {menuSections.map((group) => (
                                <div key={group.section} className="space-y-1.5">
                                    <p className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        {group.section}
                                    </p>
                                    <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.name}
                                                    type="button"
                                                    onClick={() => handleNavigate(item.path)}
                                                    className="flex w-full items-center justify-between p-3.5 text-left transition hover:bg-gray-50 active:bg-gray-100"
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bgColor} ${item.iconColor}`}
                                                        >
                                                            <Icon
                                                                size={20}
                                                                strokeWidth={2}
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {item.badge && (
                                                            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-semibold text-pink-600">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                        <ChevronRight
                                                            size={18}
                                                            className="text-gray-400"
                                                        />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center justify-between rounded-2xl border border-red-200 bg-red-50/70 p-4 text-left transition hover:bg-red-100/60 active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                            <LogOut size={20} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-red-600">
                                                Log Out
                                            </p>
                                            <p className="text-xs text-red-400">
                                                Sign out of your Snapzy session
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-red-400" />
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

export default MobileHeader;