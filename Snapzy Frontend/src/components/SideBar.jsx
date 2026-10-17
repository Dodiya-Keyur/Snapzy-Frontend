import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import {
    Home,
    Search,
    Bell,
    PlusSquare,
    User,
    Menu,
    Settings,
    Activity,
    Bookmark,
    Heart,
    LogOut,
    Camera,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import api from "../api/axios";

const Sidebar = () => {
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const moreMenuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();
    const { unreadCount, hasUnread } = useNotification();

    useEffect(() => {
        setIsMoreOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
                setIsMoreOpen(false);
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsMoreOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const menuItems = [
        {
            name: "Home",
            path: "/",
            icon: Home,
        },
        {
            name: "Search",
            path: "/search",
            icon: Search,
        },
        {
            name: "Notifications",
            path: "/notifications",
            icon: Bell,
        },
        {
            name: "Create Post",
            path: "/create-post",
            icon: PlusSquare,
        },
        {
            name: "Profile",
            path: "/profile",
            icon: User,
        },
    ];

    const moreMenuItems = [
        {
            name: "Settings",
            path: "/setting",
            icon: Settings,
        },
        {
            name: "Your Activity",
            path: "/activity",
            icon: Activity,
        },
        {
            name: "Saved Posts",
            path: "/saved",
            icon: Bookmark,
        },
        {
            name: "Liked Posts",
            path: "/liked",
            icon: Heart,
            iconClass: "text-rose-500 fill-rose-500",
        },
    ];

    const handleNavigate = (path) => {
        setIsMoreOpen(false);
        navigate(path);
    };

    const handleLogout = async () => {
        setIsMoreOpen(false);
        localStorage.removeItem("token");
        if (setUser) {
            setUser(null);
        }
        navigate("/login");
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout request failed:", error);
        }
    };

    return (
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-gray-100 px-4 py-6 hidden md:flex">
            <NavLink to="/" className="outline-none">
                <div className="mb-8 flex items-center gap-3 px-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 shadow-sm shadow-pink-500/20">
                        <Camera
                            size={22}
                            className="text-white"
                        />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Snapzy
                    </h1>
                </div>
            </NavLink>

            <nav className="flex-1">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <li key={item.name}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-white text-gray-900 font-semibold shadow-xs"
                                            : "text-gray-600 hover:bg-gray-200/60 hover:text-gray-900"
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <div className="relative flex items-center justify-center">
                                                    <Icon
                                                        size={22}
                                                        strokeWidth={isActive ? 2.5 : 2}
                                                        className="transition-transform duration-200 group-hover:scale-105"
                                                    />
                                                    {item.name === "Notifications" && hasUnread && (
                                                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 animate-pulse" />
                                                    )}
                                                </div>
                                                <span>
                                                    {item.name}
                                                </span>
                                            </div>

                                            {item.name === "Notifications" && unreadCount > 0 && (
                                                <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-600">
                                                    {unreadCount > 99 ? "99+" : unreadCount}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div ref={moreMenuRef} className="relative border-t border-gray-300 pt-3">
                {isMoreOpen && (
                    <div
                        role="menu"
                        aria-label="More options"
                        className="absolute bottom-16 left-0 w-full overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
                    >
                        <div className="space-y-1">
                            {moreMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;

                                return (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={() => handleNavigate(item.path)}
                                        className={`flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition ${isActive
                                            ? "bg-gray-100 font-semibold text-gray-900"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
                                        }`}
                                    >
                                        <Icon
                                            size={20}
                                            strokeWidth={isActive ? 2.3 : 2}
                                            className={item.iconClass || "text-gray-700"}
                                        />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="my-1.5 border-t border-gray-100" />

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 active:bg-red-100"
                        >
                            <LogOut size={20} strokeWidth={2} className="text-red-500" />
                            <span>Log out</span>
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setIsMoreOpen((prev) => !prev)}
                    aria-expanded={isMoreOpen}
                    aria-haspopup="menu"
                    className={`group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isMoreOpen
                        ? "bg-white text-gray-900 font-semibold shadow-xs"
                        : "text-gray-600 hover:bg-gray-200/60 hover:text-gray-900"
                    }`}
                >
                    <Menu
                        size={22}
                        strokeWidth={isMoreOpen ? 2.5 : 2}
                        className="transition-transform duration-200 group-hover:scale-105"
                    />
                    <span>More</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;