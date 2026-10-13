import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Heart,
    MessageCircle,
    Send,
    Bookmark,
    MoreHorizontal,
    MapPin,
    Check,
    Link2,
    Pencil,
} from "lucide-react";
import CommentModal from "./CommentModal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { formatTimeAgo } from "../utils/formatTime";

const DEFAULT_USER = {
    username: "user",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
};

const PostCard = ({ post, currentUser: propCurrentUser }) => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth() || {};
    const currentUser = propCurrentUser || authUser || DEFAULT_USER;

    const postUser = post.user || {};
    const authorUsername = postUser.username || "anonymous";
    const authorAvatar =
        postUser.profilePicture ||
        postUser.avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face";
    const postImage = post.image || post.imageUrl || "";

    const isOwnPost = Boolean(
        currentUser &&
        ((currentUser._id && postUser._id && currentUser._id === postUser._id) ||
            (currentUser.username && authorUsername && currentUser.username === authorUsername))
    );

    // States
    const [liked, setLiked] = useState(Boolean(post.isLiked ?? post.liked));
    const [likesCount, setLikesCount] = useState(
        Math.max(0, post.likesCount ?? post.likes ?? 0)
    );
    const [likeLoading, setLikeLoading] = useState(false);
    const [saved, setSaved] = useState(Boolean(post.isSaved ?? post.saved));
    const [isFollowing, setIsFollowing] = useState(postUser.isFollowing ?? false);

    // Fetch initial isLiked and verified likesCount from backend
    useEffect(() => {
        if (!post?._id) return;
        let isMounted = true;
        api.get(`/posts/${post._id}/isliked`)
            .then((res) => {
                if (isMounted && res.data) {
                    if (typeof res.data.isLiked === "boolean") {
                        setLiked(res.data.isLiked);
                    }
                    if (typeof res.data.likesCount === "number") {
                        setLikesCount(Math.max(0, res.data.likesCount));
                    }
                }
            })
            .catch((err) => {
                console.warn("Failed to fetch like status:", err);
            });
        return () => {
            isMounted = false;
        };
    }, [post?._id]);

    // Micro-interactions
    const [showHeartBurst, setShowHeartBurst] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef(null);

    // Comments
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(post.commentsList ?? []);
    const [commentCount, setCommentCount] = useState(post.commentCount ?? post.comments ?? 0);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    const handleLike = async () => {
        if (likeLoading || !post?._id) return;
        const nextLiked = !liked;
        // Optimistic UI update
        setLiked(nextLiked);
        setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

        try {
            setLikeLoading(true);
            let res;
            if (nextLiked) {
                res = await api.post(`/posts/${post._id}/like`);
            } else {
                res = await api.delete(`/posts/${post._id}/unlike`);
            }

            if (res.data) {
                const count = res.data.likesCount ?? res.data.totalLikes;
                if (typeof count === "number") {
                    setLikesCount(Math.max(0, count));
                }
                if (typeof res.data.isLiked === "boolean") {
                    setLiked(res.data.isLiked);
                }
            }
        } catch (err) {
            console.warn("Like action failed:", err);
            // Revert state on error
            setLiked(!nextLiked);
            setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
        } finally {
            setLikeLoading(false);
        }
    };

    const handleDoubleTap = () => {
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 900);

        if (!liked) {
            handleLike();
        }
    };

    const handleSave = async () => {
        const nextSaved = !saved;
        setSaved(nextSaved);

        try {
            if (nextSaved) {
                await api.post(`/posts/${post._id}/save`);
            } else {
                await api.delete(`/posts/${post._id}/unsave`);
            }
        } catch (err) {
            console.warn("Save action failed:", err);
        }
    };

    const handleFollowToggle = async () => {
        const nextFollowing = !isFollowing;
        setIsFollowing(nextFollowing);
        try {
            if (nextFollowing) {
                await api.post(`/users/${postUser._id}/follow`);
            } else {
                await api.delete(`/users/${postUser._id}/unfollow`);
            }
        } catch (err) {
            console.warn("Follow action:", err);
        }
    };

    const handleShare = async () => {
        const postUrl = `${window.location.origin}/post/${post._id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${authorUsername}'s post on Snapzy`,
                    text: post.caption || "Check out this post on Snapzy!",
                    url: postUrl,
                });
                return;
            } catch {
                // Ignore cancel
            }
        }

        try {
            await navigator.clipboard.writeText(postUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.warn("Copy link failed:", err);
        }
    };

    const handleAddComment = (text, parentId = null) => {
        const myAvatar =
            currentUser.profilePicture ||
            currentUser.avatar ||
            DEFAULT_USER.avatar;

        setComments((prev) => [
            ...prev,
            {
                id: Date.now(),
                parentId,
                username: currentUser.username || "me",
                avatar: myAvatar,
                text,
                createdAt: "Just now",
            },
        ]);
        setCommentCount((prev) => prev + 1);
    };

    const handleDeleteComment = (id) => {
        setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
        setCommentCount((prev) => Math.max(0, prev - 1));
    };

    return (
        <>
            <article className="w-full bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <img
                            src={authorAvatar}
                            alt={authorUsername}
                            className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
                        />
                        <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                                {authorUsername}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <span>{formatTimeAgo(post.createdAt)}</span>
                                {post.location && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span className="flex items-center gap-0.5 truncate capitalize">
                                            <MapPin size={11} className="text-gray-400 shrink-0" />
                                            <span className="truncate">{post.location}</span>
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Follow Button (hidden on user's own post) */}
                        {!isOwnPost && (
                            <button
                                onClick={handleFollowToggle}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition ${isFollowing
                                    ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                                    }`}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                        )}

                        {/* Options Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowMenu((prev) => !prev)}
                                className="p-1.5 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
                                aria-label="Post options"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-20 text-xs text-gray-700">
                                    {isOwnPost && (
                                        <button
                                            onClick={() => {
                                                navigate(`/edit-post/${post._id}`);
                                                setShowMenu(false);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-left transition text-gray-900 font-medium"
                                        >
                                            <Pencil size={15} className="text-gray-500" />
                                            Edit Post
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            handleShare();
                                            setShowMenu(false);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-left transition"
                                    >
                                        <Link2 size={15} className="text-gray-500" />
                                        Copy Link
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Post Image with Double-Tap Like animation */}
                <div
                    className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-gray-900 flex items-center justify-center overflow-hidden cursor-pointer select-none"
                    onDoubleClick={handleDoubleTap}
                >
                    {postImage ? (
                        <img
                            src={postImage}
                            alt={post.caption || "Post content"}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]"
                            loading="lazy"
                        />
                    ) : (
                        <div className="text-gray-400 text-sm">No image available</div>
                    )}

                    {/* Animated Heart Burst on Double Tap */}
                    {showHeartBurst && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
                            <Heart size={90} className="fill-white text-white drop-shadow-2xl" />
                        </div>
                    )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between px-4 pt-3.5 pb-1">
                    <div className="flex items-center gap-4">
                        {/* Like Button */}
                        <div className="flex items-center">
                            <button
                                onClick={handleLike}
                                className="hover:scale-110 active:scale-95 transition-transform"
                                aria-label={liked ? "Unlike post" : "Like post"}
                            >
                                <Heart
                                    size={24}
                                    className={liked ? "fill-red-500 text-red-500" : "text-gray-800 hover:text-red-500"}
                                />
                            </button>
                            <span className="ml-1.5 text-sm font-semibold text-gray-900">
                                {likesCount.toLocaleString()}
                            </span>
                        </div>

                        {/* Comment Button */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setShowComments(true)}
                                className="hover:scale-110 active:scale-95 transition-transform"
                                aria-label="Open comments"
                            >
                                <MessageCircle size={24} className="text-gray-800 hover:text-blue-500" />
                            </button>
                            <span className="ml-1.5 text-sm font-semibold text-gray-900">
                                {commentCount.toLocaleString()}
                            </span>
                        </div>

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            className="relative hover:scale-110 active:scale-95 transition-transform text-gray-800 hover:text-gray-900"
                            aria-label="Share post"
                        >
                            {copied ? (
                                <Check size={24} className="text-emerald-600" />
                            ) : (
                                <Send size={24} />
                            )}
                        </button>
                    </div>

                    {/* Bookmark / Save Button */}
                    <button
                        onClick={handleSave}
                        className="hover:scale-110 active:scale-95 transition-transform"
                        aria-label={saved ? "Unsave post" : "Save post"}
                    >
                        <Bookmark
                            size={24}
                            className={saved ? "fill-black text-black" : "text-gray-800 hover:text-black"}
                        />
                    </button>
                </div>

                {/* Caption, Hashtags & Comments Section */}
                <div className="px-4 pt-2 pb-3.5 space-y-1.5">
                    {/* Caption */}
                    {post.caption && (
                        <p className="text-sm text-gray-800 leading-5 break-words">
                            <span className="font-semibold text-gray-900 mr-2">
                                {authorUsername}
                            </span>
                            {post.caption}
                        </p>
                    )}

                    {/* Hashtags */}
                    {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {post.hashtags.map((tag, idx) => {
                                const formattedTag = tag.startsWith("#") ? tag : `#${tag}`;
                                return (
                                    <span
                                        key={idx}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition"
                                    >
                                        {formattedTag}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* View all comments button */}
                    {commentCount > 0 ? (
                        <button
                            onClick={() => setShowComments(true)}
                            className="pt-1 text-xs sm:text-sm text-gray-500 hover:text-gray-800 font-normal transition block text-left"
                        >
                            View all {commentCount.toLocaleString()} {commentCount === 1 ? "comment" : "comments"}
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowComments(true)}
                            className="pt-1 text-xs text-gray-400 hover:text-gray-600 transition block text-left"
                        >
                            Add a comment...
                        </button>
                    )}
                </div>
            </article>

            {/* Comments Popup Modal */}
            {showComments && (
                <CommentModal
                    post={{
                        ...post,
                        user: {
                            ...postUser,
                            username: authorUsername,
                            avatar: authorAvatar,
                            profilePicture: authorAvatar,
                        },
                        image: postImage,
                    }}
                    comments={comments}
                    currentUser={{
                        ...currentUser,
                        avatar:
                            currentUser.profilePicture ||
                            currentUser.avatar ||
                            DEFAULT_USER.avatar,
                    }}
                    onClose={() => setShowComments(false)}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                />
            )}
        </>
    );
};

export default PostCard;