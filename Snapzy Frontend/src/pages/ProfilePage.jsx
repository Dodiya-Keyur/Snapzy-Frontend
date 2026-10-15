import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Heart,
    MessageCircle,
    MapPin,
    Grid,
    Trash2,
    X,
    Camera,
    LoaderCircle,
    Pencil,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatTimeAgo } from "../utils/formatTime";

const DEFAULT_AVATAR =
    "https://i.pinimg.com/474x/64/99/f8/6499f89b3bd815780d60f2cbc210b2bd.jpg";

function ProfilePage() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { user: authUser, checkAuth } = useAuth();

    const isOwnProfile =
        !userId ||
        (authUser && (authUser._id === userId || authUser.username === userId));

    const [profileUser, setProfileUser] = useState(isOwnProfile ? authUser : null);
    const [posts, setPosts] = useState([]);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    // Selected post for modal detail view
    const [selectedPost, setSelectedPost] = useState(null);
    const [modalIsLiked, setModalIsLiked] = useState(false);
    const [modalLikesCount, setModalLikesCount] = useState(0);
    const [modalLikeLoading, setModalLikeLoading] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState(null);
    const [copiedProfile, setCopiedProfile] = useState(false);

    // Fetch isliked and accurate likesCount when opening post modal
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
                        // Also update posts grid state if count was outdated
                        setPosts((prev) =>
                            prev.map((p) =>
                                (p._id || p.id) === postId ? { ...p, likesCount: verifiedCount } : p
                            )
                        );
                    }
                }
            })
            .catch((err) => {
                console.warn("Failed to fetch isliked status in profile:", err);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedPost]);

    // Fetch user profile info, stats, and user posts from backend
    const loadProfileData = async () => {
        try {
            setLoading(true);

            if (isOwnProfile) {
                // 1. Fetch own user data & follower counts from /users/me
                const userPromise = api.get("/users/me").catch((err) => {
                    console.warn("Failed to fetch /users/me:", err);
                    return null;
                });

                // 2. Fetch own posts from /users/me/posts
                const postsPromise = api.get("/users/me/posts").catch((err) => {
                    console.warn("Failed to fetch /users/me/posts:", err);
                    return null;
                });

                const [userRes, postsRes] = await Promise.all([userPromise, postsPromise]);

                if (userRes?.data) {
                    const fetchedUser =
                        userRes.data.User ??
                        userRes.data.user ??
                        authUser;

                    if (fetchedUser) {
                        setProfileUser(fetchedUser);
                    }

                    if (typeof userRes.data.followersCount === "number") {
                        setFollowersCount(userRes.data.followersCount);
                    }
                    if (typeof userRes.data.followingCount === "number") {
                        setFollowingCount(userRes.data.followingCount);
                    }
                } else if (authUser) {
                    setProfileUser(authUser);
                }

                if (postsRes?.data) {
                    const fetchedPosts = Array.isArray(postsRes.data.posts)
                        ? postsRes.data.posts
                        : [];
                    setPosts(fetchedPosts);
                }
            } else {
                // Fetch other user's data from /users/:userId and posts from /users/:userId/posts
                const userPromise = api.get(`/users/${userId}`).catch((err) => {
                    console.warn("Failed to fetch /users/:userId:", err);
                    return null;
                });
                const postsPromise = api.get(`/users/${userId}/posts`).catch((err) => {
                    console.warn("Failed to fetch /users/:userId/posts:", err);
                    return null;
                });
                const followingPromise = api.get("/users/me/following").catch(() => null);

                const [userRes, postsRes, followingRes] = await Promise.all([
                    userPromise,
                    postsPromise,
                    followingPromise,
                ]);

                if (userRes?.data) {
                    const fetchedUser = userRes.data.User ?? userRes.data.user;
                    if (fetchedUser) setProfileUser(fetchedUser);
                    if (typeof userRes.data.followersCount === "number") {
                        setFollowersCount(userRes.data.followersCount);
                    }
                    if (typeof userRes.data.followingCount === "number") {
                        setFollowingCount(userRes.data.followingCount);
                    }
                }

                if (followingRes?.data) {
                    const list = followingRes.data.following || [];
                    const isFollowed = list.some(
                        (f) => (f.following?._id || f.following) === userId
                    );
                    setIsFollowing(isFollowed);
                }

                if (postsRes?.data) {
                    const fetchedPosts = Array.isArray(postsRes.data.posts)
                        ? postsRes.data.posts
                        : [];
                    setPosts(fetchedPosts);
                }
            }
        } catch (error) {
            console.error("Error loading profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfileData();
    }, [userId, authUser?._id]);

    // Handle Follow / Unfollow for another user
    const handleFollowToggle = async () => {
        if (!userId || isOwnProfile || followLoading) return;
        const nextFollowing = !isFollowing;
        setIsFollowing(nextFollowing);
        setFollowersCount((prev) => (nextFollowing ? prev + 1 : Math.max(0, prev - 1)));

        try {
            setFollowLoading(true);
            if (nextFollowing) {
                await api.post(`/follows/follow/${userId}`);
            } else {
                await api.delete(`/follows/unfollow/${userId}`);
            }
        } catch (err) {
            console.error("Follow error:", err);
            setIsFollowing(!nextFollowing);
            setFollowersCount((prev) => (!nextFollowing ? prev + 1 : Math.max(0, prev - 1)));
        } finally {
            setFollowLoading(false);
        }
    };

    // Share Profile
    const handleShareProfile = async () => {
        const profileUrl = `${window.location.origin}/profile`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${username} on Snapzy`,
                    text: `Check out ${fullName || username}'s profile on Snapzy!`,
                    url: profileUrl,
                });
                return;
            } catch {
                // Ignore cancel
            }
        }
        try {
            await navigator.clipboard.writeText(profileUrl);
            setCopiedProfile(true);
            setTimeout(() => setCopiedProfile(false), 2000);
        } catch (err) {
            console.warn("Share profile error:", err);
        }
    };

    // Delete post handler
    const handleDeletePost = async (postId) => {
        if (!postId || deletingPostId) return;

        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (!confirmDelete) return;

        try {
            setDeletingPostId(postId);
            await api.delete(`/posts/delete-post/${postId}`);

            // Remove from local list
            setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
            if (selectedPost && (selectedPost._id === postId || selectedPost.id === postId)) {
                setSelectedPost(null);
            }
        } catch (err) {
            console.error("Failed to delete post:", err);
            alert(err.response?.data?.message || "Failed to delete post. Please try again.");
        } finally {
            setDeletingPostId(null);
        }
    };

    // Toggle like in post modal
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
            console.error("Failed to toggle like in modal:", err);
            // Revert state on error
            setModalIsLiked(!nextLiked);
            setModalLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
        } finally {
            setModalLikeLoading(false);
        }
    };

    // Derived user fields with fallbacks
    const activeUser = profileUser || authUser || {};
    const username = activeUser.username || "user";
    const fullName = activeUser.name || "";
    const avatar =
        activeUser.profilePicture ||
        activeUser.avatar ||
        DEFAULT_AVATAR;
    const bio = activeUser.bio || "";

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Header Skeleton */}
                    <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xs border border-gray-100 animate-pulse">
                        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-gray-200 shrink-0" />
                            <div className="flex-1 w-full space-y-4 text-center sm:text-left">
                                <div className="h-6 w-40 bg-gray-200 rounded mx-auto sm:mx-0" />
                                <div className="h-4 w-28 bg-gray-200 rounded mx-auto sm:mx-0" />
                                <div className="flex justify-center sm:j    ustify-start gap-8 pt-2">
                                    <div className="h-8 w-16 bg-gray-200 rounded" />
                                    <div className="h-8 w-16 bg-gray-200 rounded" />
                                    <div className="h-8 w-16 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posts Grid Skeleton */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 mt-[-30px] md:mt-0">
            <div className="mx-auto max-w-4xl">
                {/* Profile Header Card - Instagram Style */}
                <div className="rounded-3xl bg-white p-5 sm:p-8 border border-gray-200/90 shadow-xs">
                    {/* Desktop View (matching Instagram Desktop) */}
                    <div className="hidden sm:flex items-start gap-10">
                        {/* Avatar */}
                        <div className="shrink-0">
                            <img
                                src={avatar}
                                alt={username}
                                className="h-32 w-32 md:h-36 md:w-36 rounded-full object-cover ring-4 ring-gray-100 shadow-sm"
                            />
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-3.5">
                            {/* 1. Username */}
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                    {username}
                                </h1>
                            </div>

                            {/* 2. Full Name */}
                            {fullName && (
                                <h2 className="text-base font-semibold text-gray-800 -mt-2">
                                    {fullName}
                                </h2>
                            )}

                            {/* 3. Stats (Posts, Followers, Following) */}
                            <div className="flex items-center gap-8 text-sm text-gray-700 pt-1">
                                <span>
                                    <strong className="font-bold text-gray-900">{posts.length}</strong>{" "}
                                    {posts.length === 1 ? "post" : "posts"}
                                </span>
                                <span>
                                    <strong className="font-bold text-gray-900">{followersCount}</strong>{" "}
                                    {followersCount === 1 ? "follower" : "followers"}
                                </span>
                                <span>
                                    <strong className="font-bold text-gray-900">{followingCount}</strong>{" "}
                                    following
                                </span>
                            </div>

                            {/* 4. Bio */}

                            {bio ? (
                                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700 max-w-lg pt-0.5">
                                    {bio}
                                </p>
                            ) : (

                                isOwnProfile && <p className="text-xs text-gray-400 italic pt-0.5">
                                    No bio yet. Tap "Edit Profile" to tell people about yourself.
                                </p>

                            )}

                            {/* 5. Action Buttons: Edit Profile or Follow/Following */}
                            <div className="flex items-center gap-3 pt-2">
                                {isOwnProfile ? (
                                    <button
                                        onClick={() => navigate("/edit-profile")}
                                        className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black active:scale-95 shadow-xs"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                        className={`rounded-xl px-6 py-2 text-sm font-semibold transition active:scale-95 shadow-xs ${isFollowing
                                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                            }`}
                                    >
                                        {isFollowing ? "Following" : "Follow"}
                                    </button>
                                )}
                                <button
                                    onClick={handleShareProfile}
                                    className="rounded-xl bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 active:scale-95 border border-gray-200"
                                >
                                    {copiedProfile ? "Link Copied!" : "Share Profile"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile View (matching Instagram Mobile) */}
                    <div className="sm:hidden space-y-4">
                        {/* Top: Avatar on left, Stats on right */}
                        <div className="flex items-center gap-6">
                            <img
                                src={avatar}
                                alt={username}
                                className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-100 shadow-sm shrink-0"
                            />
                            <div className="flex-1 flex flex-col items-start gap-4">

                                {/* Username and Full Name in one row */}
                                <div className="flex flex-col items-start gap-1 ml-5">
                                    <h1 className="text-base font-bold text-gray-900">
                                        {username}
                                    </h1>

                                    {fullName && (
                                        <h2 className="text-sm font-semibold text-gray-800">
                                            {fullName}
                                        </h2>
                                    )}
                                </div>

                                {/* Posts, Followers, Following in columns */}
                                <div className="w-full flex justify-around items-center text-center">
                                    <div>
                                        <p className="text-base font-bold text-gray-900">
                                            {posts.length}
                                        </p>
                                        <p className="text-xs text-gray-500">posts</p>
                                    </div>

                                    <div>
                                        <p className="text-base font-bold text-gray-900">
                                            {followersCount}
                                        </p>
                                        <p className="text-xs text-gray-500">followers</p>
                                    </div>

                                    <div>
                                        <p className="text-base font-bold text-gray-900">
                                            {followingCount}
                                        </p>
                                        <p className="text-xs text-gray-500">following</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="space-y-1">
                            {/* 3. Bio */}
                            {bio ? (
                                <p className="whitespace-pre-line text-sm text-gray-700 leading-snug pt-0.5">
                                    {bio}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400 italic pt-0.5">
                                    No bio yet.
                                </p>
                            )}
                        </div>

                        {/* Action Buttons: Side-by-Side (Edit profile & Share profile) */}
                        <div className="flex items-center gap-2 pt-1">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => navigate("/edit-profile")}
                                    className="flex-1 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 py-2 px-3 text-xs font-semibold text-gray-900 transition text-center"
                                >
                                    Edit profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={followLoading}
                                    className={`flex-1 rounded-xl active:scale-95 py-2 px-3 text-xs font-semibold transition text-center ${isFollowing
                                        ? "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                                        }`}
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                            )}
                            <button
                                onClick={handleShareProfile}
                                className="flex-1 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 py-2 px-3 text-xs font-semibold text-gray-900 transition text-center"
                            >
                                {copiedProfile ? "Link Copied!" : "Share profile"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Posts Section Header */}
                <div className="mt-8">
                    <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-3">
                        <div className="flex items-center gap-2 border-b-2 border-black pb-3 -mb-[14px]">
                            <Grid size={18} className="text-gray-900" />
                            <span className="text-sm font-bold uppercase tracking-wider text-gray-900">
                                Posts ({posts.length})
                            </span>
                        </div>

                        {posts.length > 0 && (
                            <button
                                onClick={() => navigate("/create-post")}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                            >
                                + New Post
                            </button>
                        )}
                    </div>

                    {/* Posts Grid */}
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
                            {posts.map((post) => {
                                const postId = post._id || post.id;
                                const postImage = post.image || post.imageUrl || "";
                                const postLikes = Math.max(0, post.likesCount ?? post.likes ?? 0);
                                const postComments = Math.max(0, post.commentCount ?? post.comments ?? 0);

                                return (
                                    <div
                                        key={postId}
                                        onClick={() => setSelectedPost(post)}
                                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-gray-100 border border-gray-200/80 shadow-2xs"
                                    >
                                        <img
                                            src={postImage}
                                            alt={post.caption || "Post"}
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />

                                        {/* Hover Overlay with Likes & Comments Counts */}
                                        <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-white font-semibold text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <Heart size={18} className="fill-white" />
                                                <span>{postLikes}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MessageCircle size={18} className="fill-white" />
                                                <span>{postComments}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 text-gray-800 border border-gray-200 shadow-2xs">
                                <Camera size={36} strokeWidth={1.75} />
                            </div>

                            <h2 className="mb-1.5 text-xl font-bold tracking-tight text-gray-900">
                                Share Photos
                            </h2>
                            <p className="mb-6 max-w-sm text-sm text-gray-500">
                                When you share photos, they will appear on your profile.
                            </p>

                            <button
                                onClick={() => navigate("/create-post")}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
                            >
                                Share your first photo
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Post Detail Modal */}
            {selectedPost && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in"
                    onClick={() => setSelectedPost(null)}
                >
                    <div
                        className="relative flex flex-col w-full max-w-md sm:max-w-lg lg:max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="shrink-0 flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-3.5">
                            <div className="flex items-center gap-3">
                                <img
                                    src={avatar}
                                    alt={username}
                                    className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                                        {username}
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

                        {/* Modal Image */}
                        <div className="shrink min-h-0 max-h-[46vh] sm:max-h-[50vh] w-full bg-black flex items-center justify-center overflow-hidden">
                            <img
                                src={selectedPost.image || selectedPost.imageUrl}
                                alt={selectedPost.caption || "Post preview"}
                                className="max-h-[46vh] sm:max-h-[50vh] w-auto max-w-full object-contain"
                            />
                        </div>

                        {/* Modal Body & Actions */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                            {/* Likes and Comments Counters */}
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

                            {/* Caption */}
                            {selectedPost.caption && (
                                <p className="text-sm text-gray-800 leading-relaxed">
                                    <span className="font-semibold text-gray-900 mr-2">
                                        {username}
                                    </span>
                                    {selectedPost.caption}
                                </p>
                            )}

                            {/* Hashtags */}
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

                            {/* Modal Footer Controls (Only for own post: Delete & Edit, no Close button at bottom) */}
                            {isOwnProfile && (
                                <div className="flex items-center justify-between border-t border-gray-100 pt-3 shrink-0">
                                    <button
                                        onClick={() => handleDeletePost(selectedPost._id || selectedPost.id)}
                                        disabled={deletingPostId === (selectedPost._id || selectedPost.id)}
                                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 transition disabled:opacity-50"
                                    >
                                        {deletingPostId === (selectedPost._id || selectedPost.id) ? (
                                            <LoaderCircle size={15} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={15} />
                                        )}
                                        <span>Delete Post</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const pId = selectedPost._id || selectedPost.id;
                                            setSelectedPost(null);
                                            navigate(`/edit-post/${pId}`);
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-black transition active:scale-95 shadow-xs"
                                    >
                                        <Pencil size={14} />
                                        <span>Edit Post</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfilePage;


