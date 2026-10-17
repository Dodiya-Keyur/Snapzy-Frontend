import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const DEFAULT_AVATAR =
    "https://i.pinimg.com/474x/64/99/f8/6499f89b3bd815780d60f2cbc210b2bd.jpg";

const footerLinks = ["About", "Help", "Press", "API", "Privacy", "Terms"];

function Avatar({ src, alt = "avatar", size = "h-10 w-10", ring = false }) {
    const [imgSrc, setImgSrc] = useState(src || DEFAULT_AVATAR);

    useEffect(() => {
        setImgSrc(src || DEFAULT_AVATAR);
    }, [src]);

    const imageElement = (
        <img
            src={imgSrc}
            alt={alt}
            onError={() => setImgSrc(DEFAULT_AVATAR)}
            className={`${size} rounded-full object-cover`}
        />
    );

    if (!ring) {
        return imageElement;
    }

    return (
        <div className="rounded-full p-[2px]">
            <div className="rounded-full bg-white p-[2px]">
                {imageElement}
            </div>
        </div>
    );
}

function RightSidebar() {
    const navigate = useNavigate();
    const { user, setUser, loading: authLoading } = useAuth();

    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [following, setFollowing] = useState({});
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const fetchSuggestions = useCallback(async () => {
        try {
            setLoadingSuggestions(true);
            const res = await api.get("/users/suggested");
            const userList = res.data?.users || [];
            setSuggestions(userList);

            const initialMap = {};
            userList.forEach((u) => {
                const id = (u._id || u.id)?.toString();
                if (id) {
                    initialMap[id] = Boolean(u.isFollowing);
                }
            });
            setFollowing(initialMap);
        } catch (error) {
            console.error("Failed to fetch suggested users:", error);
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    }, []);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    const toggleFollow = async (userId) => {
        if (!userId || actionLoadingId === userId) return;

        const idStr = userId.toString();
        const isCurrentlyFollowing = !!following[idStr];
        const nextState = !isCurrentlyFollowing;

        setFollowing((prev) => ({ ...prev, [idStr]: nextState }));
        setActionLoadingId(idStr);

        try {
            if (isCurrentlyFollowing) {
                await api.delete(`/follows/unfollow/${idStr}`);
            } else {
                await api.post(`/follows/follow/${idStr}`);
            }
        } catch (error) {
            console.error("Failed to toggle follow status:", error);
            setFollowing((prev) => ({ ...prev, [idStr]: isCurrentlyFollowing }));
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleSwitch = async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.error("Switch account logout error:", err);
        }
        localStorage.removeItem("token");
        if (setUser) {
            setUser(null);
        }
        navigate("/login");
    };

    return (
        <aside className="sticky top-6 w-80">
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm ring-1 ring-gray-200/70">
                {authLoading ? (
                    <div className="flex w-full items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gray-200" />
                            <div className="space-y-1.5">
                                <div className="h-3.5 w-20 rounded bg-gray-200" />
                                <div className="h-2.5 w-24 rounded bg-gray-200" />
                            </div>
                        </div>
                        <div className="h-6 w-12 rounded-full bg-gray-200" />
                    </div>
                ) : (
                    <>
                        <Link
                            to="/profile"
                            className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-90"
                        >
                            <Avatar
                                ring
                                size="h-12 w-12"
                                src={user?.profilePicture || DEFAULT_AVATAR}
                                alt={user?.username || "Current user"}
                            />

                            <div className="min-w-0 leading-tight">
                                <p className="flex items-center gap-1 text-sm font-semibold text-gray-900 truncate">
                                    <span className="truncate">{user?.username || "User"}</span>
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4 shrink-0 text-blue-500 fill-blue-500"
                                    >
                                        <path d="M12 2l2.4 1.7 2.9-.1 1 2.7 2.4 1.7-.9 2.8.9 2.8-2.4 1.7-1 2.7-2.9-.1L12 22l-2.4-1.7-2.9.1-1-2.7-2.4-1.7.9-2.8-.9-2.8 2.4-1.7 1-2.7 2.9.1L12 2zm-1.2 13.4l5-5-1.4-1.4-3.6 3.6-1.6-1.6-1.4 1.4 3 3z" />
                                    </svg>
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                    {user?.name || user?.username || "Snapzy User"}
                                </p>
                            </div>
                        </Link>

                        <button
                            type="button"
                            onClick={handleSwitch}
                            className="ml-2 shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-blue-500 transition hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                        >
                            Switch
                        </button>
                    </>
                )}
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/70">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-500">
                        Suggested for you
                    </p>

                    <Link
                        to="/search"
                        className="text-xs font-semibold text-gray-900 transition hover:text-blue-500"
                    >
                        See All
                    </Link>
                </div>

                {loadingSuggestions ? (
                    <div className="space-y-3 py-1">
                        {[1, 2, 3, 4, 5].map((idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 animate-pulse"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                                    <div className="space-y-1.5">
                                        <div className="h-3.5 w-24 rounded bg-gray-200" />
                                        <div className="h-2.5 w-28 rounded bg-gray-200" />
                                    </div>
                                </div>
                                <div className="h-7 w-16 rounded-full bg-gray-200 shrink-0" />
                            </div>
                        ))}
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">
                        No suggestions found
                    </div>
                ) : (
                    <div className="space-y-1">
                        {suggestions.map((suggestedUser) => {
                            const uId = (suggestedUser._id || suggestedUser.id)?.toString();
                            const isFollowing = !!following[uId];
                            const isActionLoading = actionLoadingId === uId;

                            return (
                                <div
                                    key={uId}
                                    className="group flex items-center justify-between rounded-xl p-2 transition hover:bg-gray-50"
                                >
                                    <Link
                                        to={`/profile/${uId}`}
                                        className="flex min-w-0 flex-1 items-center gap-3"
                                    >
                                        <div className="transition-transform duration-200 group-hover:scale-105 shrink-0">
                                            <Avatar
                                                ring
                                                src={suggestedUser.profilePicture || DEFAULT_AVATAR}
                                                alt={suggestedUser.username || "Suggested user"}
                                            />
                                        </div>

                                        <div className="min-w-0 leading-tight">
                                            <p className="truncate text-sm font-semibold text-gray-900 group-hover:underline">
                                                {suggestedUser.username}
                                            </p>
                                            <p className="truncate text-xs text-gray-400">
                                                {suggestedUser.reason || "Suggested for you"}
                                            </p>
                                        </div>
                                    </Link>

                                    <button
                                        type="button"
                                        disabled={isActionLoading}
                                        onClick={() => toggleFollow(uId)}
                                        className={`ml-2 shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition active:scale-95 disabled:opacity-60 ${
                                            isFollowing
                                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                : "bg-blue-500 text-white shadow-sm hover:bg-blue-600"
                                        }`}
                                    >
                                        {isFollowing ? "Following" : "Follow"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="mt-6 px-2">
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400">
                    {footerLinks.map((link) => (
                        <a
                            key={link}
                            href="#"
                            className="transition hover:text-gray-600 hover:underline"
                        >
                            {link}
                        </a>
                    ))}
                </div>

                <p className="mt-3 text-xs uppercase tracking-wide text-gray-300">
                    © 2026 Snapzy
                </p>
            </div>
        </aside>
    );
}

export default RightSidebar;