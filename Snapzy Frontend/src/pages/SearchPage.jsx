import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    X,
    User,
    Image as ImageIcon,
    Heart,
    MessageCircle,
    MapPin,
    LoaderCircle,
    Sparkles,
    Pencil,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatTimeAgo } from "../utils/formatTime";

const DEFAULT_AVATAR =
    "https://i.pinimg.com/474x/64/99/f8/6499f89b3bd815780d60f2cbc210b2bd.jpg";

function SearchPage() {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all"); // 'all' | 'user' | 'post'
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Track which user IDs are followed
    const [followingIds, setFollowingIds] = useState(new Set());
    const [followingActionId, setFollowingActionId] = useState(null);

    // Selected post for modal detail view
    const [selectedPost, setSelectedPost] = useState(null);
    const [modalIsLiked, setModalIsLiked] = useState(false);
    const [modalLikesCount, setModalLikesCount] = useState(0);
    const [modalLikeLoading, setModalLikeLoading] = useState(false);

    // Fetch isliked and accurate count when opening post modal in search
    useEffect(() => {
        if (!selectedPost) return;
        const postId = selectedPost._id || selectedPost.id;
        if (!postId) return;

        setModalLikesCount(Math.max(0, selectedPost.likesCount ?? selectedPost.likes ?? 0));
        setModalIsLiked(Boolean(selectedPost.isLiked));

        let isMounted = true;
        api.get(`/posts/${postId}/isliked`)
            .then((res) => {
                if (isMounted && res.data) {
                    if (typeof res.data.isLiked === "boolean") {
                        setModalIsLiked(res.data.isLiked);
                    }
                    if (typeof res.data.likesCount === "number") {
                        const verifiedCount = Math.max(0, res.data.likesCount);
                        setModalLikesCount(verifiedCount);
                        setPosts((prev) =>
                            prev.map((p) =>
                                (p._id || p.id) === postId ? { ...p, likesCount: verifiedCount } : p
                            )
                        );
                    }
                }
            })
            .catch((err) => {
                console.warn("Failed to fetch isliked status in search:", err);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedPost]);

    // Handle modal like toggle
    const handleModalLikeToggle = async () => {
        if (!selectedPost || modalLikeLoading) return;
        const postId = selectedPost._id || selectedPost.id;
        if (!postId) return;

        const nextLiked = !modalIsLiked;
        setModalIsLiked(nextLiked);
        setModalLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

        try {
            setModalLikeLoading(true);
            let res;
            if (nextLiked) {
                res = await api.post(`/posts/${postId}/like`);
            } else {
                res = await api.delete(`/posts/${postId}/unlike`);
            }

            if (res.data) {
                const count = res.data.likesCount ?? res.data.totalLikes;
                if (typeof count === "number") {
                    const safeCount = Math.max(0, count);
                    setModalLikesCount(safeCount);
                    setPosts((prev) =>
                        prev.map((p) =>
                            (p._id || p.id) === postId ? { ...p, likesCount: safeCount, isLiked: nextLiked } : p
                        )
                    );
                }
                if (typeof res.data.isLiked === "boolean") {
                    setModalIsLiked(res.data.isLiked);
                }
            }
        } catch (err) {
            console.error("Failed to toggle like in search modal:", err);
            setModalIsLiked(!nextLiked);
            setModalLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
        } finally {
            setModalLikeLoading(false);
        }
    };

    const debounceTimerRef = useRef(null);

    // Fetch list of users the current user is following
    const fetchMyFollowing = useCallback(async () => {
        try {
            const res = await api.get("/users/me/following");
            const list = res.data?.following || [];
            const ids = new Set(
                list.map((item) =>
                    (item.following?._id || item.following || item._id).toString()
                )
            );
            setFollowingIds(ids);
        } catch (err) {
            console.warn("Failed to fetch following list:", err);
        }
    }, []);

    useEffect(() => {
        fetchMyFollowing();
    }, [fetchMyFollowing]);

    // Handle Follow / Unfollow
    const handleToggleFollow = async (userId) => {
        if (!userId || followingActionId === userId) return;

        const idStr = userId.toString();
        const isCurrentlyFollowing = followingIds.has(idStr);

        // Optimistic toggle
        setFollowingIds((prev) => {
            const next = new Set(prev);
            if (isCurrentlyFollowing) {
                next.delete(idStr);
            } else {
                next.add(idStr);
            }
            return next;
        });

        try {
            setFollowingActionId(userId);
            if (isCurrentlyFollowing) {
                await api.delete(`/follows/unfollow/${userId}`);
            } else {
                await api.post(`/follows/follow/${userId}`);
            }
        } catch (err) {
            console.error("Follow/unfollow error:", err);
            // Revert on error
            setFollowingIds((prev) => {
                const next = new Set(prev);
                if (isCurrentlyFollowing) {
                    next.add(idStr);
                } else {
                    next.delete(idStr);
                }
                return next;
            });
        } finally {
            setFollowingActionId(null);
        }
    };

    // Perform API search
    const executeSearch = useCallback(async (query) => {
        const trimmed = query.trim();
        if (!trimmed) {
            setUsers([]);
            setPosts([]);
            setHasSearched(false);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setHasSearched(true);

            const encoded = encodeURIComponent(trimmed);
            let res;

            // Attempt standard API route /search
            try {
                res = await api.get(`/search?q=${encoded}`);
            } catch (err) {
                // If 404, fallback to root /search (in case backend router lacks /api prefix)
                if (err.response?.status === 404) {
                    res = await api.get(`/search?q=${encoded}`, {
                        baseURL: "http://localhost:3000",
                    });
                } else {
                    throw err;
                }
            }

            const data = res.data?.data || res.data || {};
            const fetchedUsers = Array.isArray(data.users) ? data.users : [];
            const fetchedPosts = Array.isArray(data.posts) ? data.posts : [];

            setUsers(fetchedUsers);
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Search API error:", error);
            setUsers([]);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Live search debouncing
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (search.trim()) {
            debounceTimerRef.current = setTimeout(() => {
                executeSearch(search);
            }, 350);
        } else {
            setUsers([]);
            setPosts([]);
            setHasSearched(false);
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [search, executeSearch]);

    // Manual form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        executeSearch(search);
    };

    // Quick tag click handler
    const handleQuickSearch = (tag) => {
        setSearch(tag);
        executeSearch(tag);
    };

    const clearSearch = () => {
        setSearch("");
        setUsers([]);
        setPosts([]);
        setHasSearched(false);
    };

    // Filtered results
    const showUsers = filter === "all" || filter === "user";
    const showPosts = filter === "all" || filter === "post";
    const totalResultsCount = users.length + posts.length;

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 mt-[-30px] md:mt-0">
            <div className="mx-auto w-full max-w-3xl">
                {/* Page Title Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        Search
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Find people, captions, and hashtags on Snapzy
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="mb-4 flex gap-2 rounded-2xl bg-white p-1.5 shadow-xs border border-gray-200/80">
                    <button
                        onClick={() => setFilter("all")}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${filter === "all"
                            ? "bg-gray-900 text-white shadow-xs"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        All {hasSearched && `(${totalResultsCount})`}
                    </button>

                    <button
                        onClick={() => setFilter("user")}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${filter === "user"
                            ? "bg-gray-900 text-white shadow-xs"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        Users {hasSearched && `(${users.length})`}
                    </button>

                    <button
                        onClick={() => setFilter("post")}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${filter === "post"
                            ? "bg-gray-900 text-white shadow-xs"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        Posts {hasSearched && `(${posts.length})`}
                    </button>
                </div>

                {/* Search Bar Input */}
                <form onSubmit={handleSubmit} className="mb-6 flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={19}
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={
                                filter === "user"
                                    ? "Search by username..."
                                    : filter === "post"
                                        ? "Search by caption or hashtag..."
                                        : "Search creators, topics, or #hashtags..."
                            }
                            className="w-full rounded-2xl border border-gray-200/90 bg-white py-3.5 pl-11 pr-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black shadow-xs"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="rounded-2xl bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-black active:scale-95 shrink-0"
                    >
                        Search
                    </button>
                </form>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <LoaderCircle size={32} className="animate-spin text-gray-800" />
                        <p className="text-sm text-gray-500">Searching Snapzy...</p>
                    </div>
                )}

                {/* Initial Blank State (Before Search) */}
                {!loading && !hasSearched && (
                    <div className="rounded-3xl border border-gray-200/90 bg-white p-8 sm:p-12 text-center shadow-xs">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 text-blue-600">
                            <Sparkles size={28} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Explore Snapzy
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                            Search for your friends, favorite creators, captions, or popular hashtags.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                            <span className="text-xs text-gray-400 mr-1">Suggestions:</span>
                            {["keyur", "ironman", "tech", "photography"].map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleQuickSearch(tag)}
                                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 hover:border-gray-300"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {!loading && hasSearched && (
                    <div className="space-y-6">
                        {/* Users List Section */}
                        {showUsers && users.length > 0 && (
                            <div className="space-y-3">
                                {filter === "all" && (
                                    <div className="flex items-center gap-2 px-1">
                                        <User size={16} className="text-gray-500" />
                                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Users ({users.length})
                                        </h2>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {users.map((u) => {
                                        const userAvatar =
                                            u.profilePicture ||
                                            u.avatar ||
                                            DEFAULT_AVATAR;
                                        const isSelf =
                                            authUser &&
                                            (authUser._id === u._id ||
                                                authUser.username === u.username);
                                        const isFollowing =
                                            u._id && followingIds.has(String(u._id));
                                        const isActionLoading =
                                            followingActionId === u._id;

                                        return (
                                            <div
                                                key={u._id || u.username}
                                                onClick={() =>
                                                    navigate(
                                                        isSelf
                                                            ? "/profile"
                                                            : `/profile/${u._id || u.username}`
                                                    )
                                                }
                                                className="group flex items-center justify-between rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs transition hover:border-gray-300 hover:shadow-sm cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <img
                                                        src={userAvatar}
                                                        alt={u.username}
                                                        className="h-12 w-12 rounded-full object-cover ring-1 ring-gray-100 shrink-0 group-hover:scale-105 transition-transform"
                                                    />

                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                            {u.username}
                                                        </h3>
                                                        {u.name && (
                                                            <p className="text-xs text-gray-600 truncate">
                                                                {u.name}
                                                            </p>
                                                        )}
                                                        {u.bio && (
                                                            <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">
                                                                {u.bio}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {isSelf ? (
                                                    <span className="rounded-xl bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-gray-600 shrink-0">
                                                        Your Profile
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleFollow(u._id);
                                                        }}
                                                        disabled={isActionLoading}
                                                        className={`rounded-xl px-4 py-2 text-xs font-semibold transition active:scale-95 shrink-0 min-w-[90px] text-center ${isFollowing
                                                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
                                                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                                                            }`}
                                                    >
                                                        {isActionLoading ? (
                                                            <LoaderCircle
                                                                size={14}
                                                                className="animate-spin mx-auto"
                                                            />
                                                        ) : isFollowing ? (
                                                            "Following"
                                                        ) : (
                                                            "Follow"
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Posts Grid Section */}
                        {showPosts && posts.length > 0 && (
                            <div className="space-y-3">
                                {filter === "all" && (
                                    <div className="flex items-center gap-2 px-1 pt-2">
                                        <ImageIcon size={16} className="text-gray-500" />
                                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Posts ({posts.length})
                                        </h2>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {posts.map((post) => {
                                        const postId = post._id || post.id;
                                        const postImage = post.image || post.imageUrl || "";
                                        const likes = post.likesCount ?? post.likes ?? 0;
                                        const comments = post.commentCount ?? post.comments ?? 0;
                                        const postAuthor = post.user?.username || "creator";

                                        return (
                                            <div
                                                key={postId}
                                                onClick={() => setSelectedPost(post)}
                                                className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-gray-100 border border-gray-200/80 shadow-2xs"
                                            >
                                                <img
                                                    src={postImage}
                                                    alt={post.caption || "Post content"}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                    loading="lazy"
                                                />

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 flex flex-col justify-between bg-black/50 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-white">
                                                    <span className="text-xs font-semibold truncate drop-shadow">
                                                        @{postAuthor}
                                                    </span>

                                                    <div className="flex items-center justify-center gap-4 text-xs font-semibold">
                                                        <div className="flex items-center gap-1">
                                                            <Heart size={15} className="fill-white" />
                                                            <span>{likes}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MessageCircle size={15} className="fill-white" />
                                                            <span>{comments}</span>
                                                        </div>
                                                    </div>

                                                    {post.caption ? (
                                                        <p className="text-[11px] line-clamp-1 text-white/90">
                                                            {post.caption}
                                                        </p>
                                                    ) : (
                                                        <span />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* No Results Found */}
                        {totalResultsCount === 0 && (
                            <div className="rounded-3xl border border-gray-200/90 bg-white p-12 text-center shadow-xs">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                                    <Search size={24} />
                                </div>
                                <h2 className="text-base font-bold text-gray-900">
                                    No results found
                                </h2>
                                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                                    We couldn't find any results for "{search}". Try searching with different keywords or hashtags.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Detail Modal */}
            {
                selectedPost &&
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in"
                        onClick={() => setSelectedPost(null)}
                    >
                        <div
                            className="relative flex flex-col w-full max-w-md sm:max-w-lg lg:max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="shrink-0 flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-3.5">
                                <div
                                    onClick={() => {
                                        const authorId = selectedPost.user?._id;
                                        const isSelf =
                                            authUser &&
                                            (authUser._id === authorId ||
                                                authUser.username === selectedPost.user?.username);
                                        navigate(
                                            isSelf
                                                ? "/profile"
                                                : `/profile/${authorId || selectedPost.user?.username}`
                                        );
                                        setSelectedPost(null);
                                    }}
                                    className="flex items-center gap-3 cursor-pointer group"
                                >
                                    <img
                                        src={
                                            selectedPost.user?.profilePicture ||
                                            selectedPost.user?.avatar ||
                                            DEFAULT_AVATAR
                                        }
                                        alt={selectedPost.user?.username || "author"}
                                        className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200 group-hover:ring-blue-500 transition"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition">
                                            {selectedPost.user?.username || "anonymous"}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{formatTimeAgo(selectedPost.createdAt)}</span>
                                            {selectedPost.location && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-0.5 capitalize">
                                                        <MapPin size={11} className="text-gray-400" />
                                                        {selectedPost.location}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                                    aria-label="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Image */}
                            <div className="shrink min-h-0 max-h-[46vh] sm:max-h-[50vh] w-full bg-black flex items-center justify-center overflow-hidden">
                                <img
                                    src={selectedPost.image || selectedPost.imageUrl}
                                    alt={selectedPost.caption || "Post preview"}
                                    className="max-h-[46vh] sm:max-h-[50vh] w-auto max-w-full object-contain"
                                />
                            </div>

                            {/* Caption & Actions */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                                <div className="flex items-center gap-6 text-sm text-gray-700">
                                    <button
                                        type="button"
                                        onClick={handleModalLikeToggle}
                                        disabled={modalLikeLoading}
                                        className="flex items-center gap-1.5 font-semibold transition hover:opacity-80 active:scale-95 cursor-pointer disabled:opacity-60"
                                        title={modalIsLiked ? "Unlike post" : "Like post"}
                                    >
                                        <Heart
                                            size={20}
                                            className={
                                                modalIsLiked
                                                    ? "fill-red-500 text-red-500 scale-105 transition-transform"
                                                    : "text-gray-600 hover:text-red-500 transition-colors"
                                            }
                                        />
                                        <span>
                                            {Math.max(0, modalLikesCount).toLocaleString()} likes
                                        </span>
                                    </button>
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <MessageCircle size={20} className="text-gray-600" />
                                        <span>
                                            {Math.max(
                                                0,
                                                selectedPost.commentCount ?? selectedPost.comments ?? 0
                                            ).toLocaleString()}{" "}
                                            comments
                                        </span>
                                    </div>
                                </div>

                                {selectedPost.caption && (
                                    <p className="text-sm text-gray-800 leading-relaxed">
                                        <span className="font-semibold text-gray-900 mr-2">
                                            {selectedPost.user?.username || "creator"}
                                        </span>
                                        {selectedPost.caption}
                                    </p>
                                )}

                                {Array.isArray(selectedPost.hashtags) && selectedPost.hashtags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedPost.hashtags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs font-medium text-blue-600"
                                            >
                                                {tag.startsWith("#") ? tag : `#${tag}`}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
}

export default SearchPage;

