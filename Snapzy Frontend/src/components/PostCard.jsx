import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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

let myFollowingCache = null;
let myFollowingPromise = null;

const fetchMyFollowingIds = async () => {
    if (myFollowingCache) return myFollowingCache;
    if (myFollowingPromise) return myFollowingPromise;

    myFollowingPromise = api
        .get("/users/me/following")
        .then((res) => {
            const list = res.data?.following || [];
            const ids = new Set(
                list.map((item) =>
                    (item.following?._id || item.following || item._id || item).toString()
                )
            );
            myFollowingCache = ids;
            myFollowingPromise = null;
            return ids;
        })
        .catch((err) => {
            console.warn("Failed to fetch my following list:", err);
            myFollowingPromise = null;
            return myFollowingCache || new Set();
        });

    return myFollowingPromise;
};

let mySavedPostsCache = null;
let mySavedPostsPromise = null;

const fetchMySavedPostIds = async () => {
    if (mySavedPostsCache) return mySavedPostsCache;
    if (mySavedPostsPromise) return mySavedPostsPromise;

    mySavedPostsPromise = api
        .get("/users/me/saved-posts")
        .then((res) => {
            const list =
                res.data?.savedPosts ??
                res.data?.data?.savedPosts ??
                res.data?.posts ??
                res.data?.data ??
                [];
            const ids = new Set(
                list
                    .map((item) => (item?._id || item?.post?._id || item)?.toString())
                    .filter(Boolean)
            );
            mySavedPostsCache = ids;
            mySavedPostsPromise = null;
            return ids;
        })
        .catch((err) => {
            console.warn("Failed to fetch my saved posts list:", err);
            mySavedPostsPromise = null;
            return mySavedPostsCache || new Set();
        });

    return mySavedPostsPromise;
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

    const postId = (post?._id || post?.id)?.toString();
    const currentUserId = (currentUser?._id || authUser?._id || "")?.toString();
    const postAuthorId = (postUser?._id || (typeof postUser === "string" ? postUser : ""))?.toString();
    const currentUserName = currentUser?.username || authUser?.username || "";

    const isOwnPost = Boolean(
        (currentUserId && postAuthorId && currentUserId === postAuthorId) ||
        (currentUserName && authorUsername && currentUserName.toLowerCase() === authorUsername.toLowerCase())
    );

    const handleOpenProfile = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isOwnPost) {
            navigate("/profile");
        } else if (postAuthorId) {
            navigate(`/profile/${postAuthorId}`);
        } else if (authorUsername && authorUsername !== "anonymous") {
            navigate(`/profile/${authorUsername}`);
        } else {
            navigate("/profile");
        }
    };

    const [liked, setLiked] = useState(Boolean(post.isLiked ?? post.liked));
    const [likesCount, setLikesCount] = useState(
        Math.max(0, post.likesCount ?? post.likes ?? 0)
    );
    const [likeLoading, setLikeLoading] = useState(false);
    const [saved, setSaved] = useState(() => {
        if (typeof post.isSaved === "boolean") return post.isSaved;
        if (typeof post.saved === "boolean") return post.saved;
        if (postId && mySavedPostsCache) {
            return mySavedPostsCache.has(postId);
        }
        return false;
    });
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        if (!postId) return;

        if (typeof post.isSaved === "boolean") {
            setSaved(post.isSaved);
        } else if (typeof post.saved === "boolean") {
            setSaved(post.saved);
        } else {
            fetchMySavedPostIds().then((ids) => {
                if (ids && postId) {
                    setSaved(ids.has(postId));
                }
            });
        }

        const handleSavedSync = (e) => {
            if (e.detail?.postId && postId && e.detail.postId.toString() === postId) {
                setSaved(Boolean(e.detail.isSaved));
            }
        };

        window.addEventListener("snapzy:saved-changed", handleSavedSync);
        return () => {
            window.removeEventListener("snapzy:saved-changed", handleSavedSync);
        };
    }, [postId, post.isSaved, post.saved]);

    const [isFollowing, setIsFollowing] = useState(() => {
        if (typeof postUser.isFollowing === "boolean") {
            return postUser.isFollowing;
        }
        if (postAuthorId && myFollowingCache) {
            return myFollowingCache.has(postAuthorId);
        }
        return false;
    });
    const [followLoading, setFollowLoading] = useState(false);
    const [showUnfollowModal, setShowUnfollowModal] = useState(false);

    useEffect(() => {
        if (!postAuthorId || isOwnPost) return;

        if (typeof postUser.isFollowing === "boolean") {
            setIsFollowing(postUser.isFollowing);
        } else {
            fetchMyFollowingIds().then((ids) => {
                if (ids && postAuthorId) {
                    setIsFollowing(ids.has(postAuthorId));
                }
            });
        }

        const handleFollowSync = (e) => {
            if (e.detail?.userId && postAuthorId && e.detail.userId === postAuthorId) {
                setIsFollowing(Boolean(e.detail.isFollowing));
            }
        };

        window.addEventListener("snapzy:follow-changed", handleFollowSync);
        return () => {
            window.removeEventListener("snapzy:follow-changed", handleFollowSync);
        };
    }, [postAuthorId, isOwnPost, postUser.isFollowing]);

    useEffect(() => {
        if (!showUnfollowModal) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowUnfollowModal(false);
            }
        };

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showUnfollowModal]);

    useEffect(() => {
        if (!post?._id) return;

        if (typeof post.isLiked === "boolean") {
            setLiked(post.isLiked);
            if (typeof post.likesCount === "number") {
                setLikesCount(Math.max(0, post.likesCount));
            }
            return;
        }

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
    }, [post?._id, post.isLiked, post.likesCount]);

    const [showHeartBurst, setShowHeartBurst] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef(null);

    const [showComments, setShowComments] = useState(false);
    const initialCommentCount = Number(
        post.commentCount ??
        post.commentsCount ??
        post.totalComments ??
        (Array.isArray(post.comments) ? post.comments.length : undefined) ??
        (typeof post.comments === "number" ? post.comments : 0)
    ) || 0;
    const [commentCount, setCommentCount] = useState(initialCommentCount);

    useEffect(() => {
        const count =
            post.commentCount ??
            post.commentsCount ??
            post.totalComments ??
            (Array.isArray(post.comments) ? post.comments.length : undefined) ??
            (typeof post.comments === "number" ? post.comments : undefined);

        if (typeof count === "number") {
            setCommentCount(Math.max(0, count));
        }
    }, [post.commentCount, post.commentsCount, post.totalComments, post.comments]);

    useEffect(() => {
        if (!postId) return;

        const handleCommentCountSync = (e) => {
            if (e.detail?.postId && e.detail.postId.toString() === postId) {
                if (typeof e.detail.commentCount === "number") {
                    setCommentCount(Math.max(0, e.detail.commentCount));
                } else if (typeof e.detail.delta === "number") {
                    setCommentCount((prev) => Math.max(0, prev + e.detail.delta));
                }
            }
        };

        window.addEventListener("snapzy:comment-count-changed", handleCommentCountSync);
        return () => {
            window.removeEventListener("snapzy:comment-count-changed", handleCommentCountSync);
        };
    }, [postId]);

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
        if (!postId || saveLoading) return;
        const nextSaved = !saved;

        setSaved(nextSaved);
        if (mySavedPostsCache) {
            if (nextSaved) {
                mySavedPostsCache.add(postId);
            } else {
                mySavedPostsCache.delete(postId);
            }
        }
        window.dispatchEvent(
            new CustomEvent("snapzy:saved-changed", {
                detail: { postId, isSaved: nextSaved },
            })
        );

        try {
            setSaveLoading(true);
            if (nextSaved) {
                await api.post(`/posts/${postId}/save`);
            } else {
                await api.delete(`/posts/${postId}/save`);
            }
        } catch (err) {
            console.warn("Save action failed:", err);
            setSaved(!nextSaved);
            if (mySavedPostsCache) {
                if (!nextSaved) {
                    mySavedPostsCache.add(postId);
                } else {
                    mySavedPostsCache.delete(postId);
                }
            }
            window.dispatchEvent(
                new CustomEvent("snapzy:saved-changed", {
                    detail: { postId, isSaved: !nextSaved },
                })
            );
        } finally {
            setSaveLoading(false);
        }
    };

    const handleFollowButtonClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isOwnPost || followLoading || !postAuthorId) return;

        if (isFollowing) {
            setShowUnfollowModal(true);
        } else {
            executeFollow();
        }
    };

    const executeFollow = async () => {
        if (!postAuthorId || followLoading) return;

        try {
            setFollowLoading(true);
            setIsFollowing(true);

            if (myFollowingCache) {
                myFollowingCache.add(postAuthorId);
            }
            window.dispatchEvent(
                new CustomEvent("snapzy:follow-changed", {
                    detail: { userId: postAuthorId, isFollowing: true },
                })
            );

            await api.post(`/follows/follow/${postAuthorId}`);
        } catch (err) {
            console.warn("Follow action failed:", err);
            if (err.response?.status !== 409) {
                setIsFollowing(false);
                if (myFollowingCache) {
                    myFollowingCache.delete(postAuthorId);
                }
                window.dispatchEvent(
                    new CustomEvent("snapzy:follow-changed", {
                        detail: { userId: postAuthorId, isFollowing: false },
                    })
                );
            }
        } finally {
            setFollowLoading(false);
        }
    };

    const handleConfirmUnfollow = async () => {
        if (!postAuthorId || followLoading) return;

        try {
            setFollowLoading(true);
            setShowUnfollowModal(false);
            setIsFollowing(false);

            if (myFollowingCache) {
                myFollowingCache.delete(postAuthorId);
            }
            window.dispatchEvent(
                new CustomEvent("snapzy:follow-changed", {
                    detail: { userId: postAuthorId, isFollowing: false },
                })
            );

            await api.delete(`/follows/unfollow/${postAuthorId}`);
        } catch (err) {
            console.warn("Unfollow action failed:", err);
            if (err.response?.status !== 404) {
                setIsFollowing(true);
                if (myFollowingCache) {
                    myFollowingCache.add(postAuthorId);
                }
                window.dispatchEvent(
                    new CustomEvent("snapzy:follow-changed", {
                        detail: { userId: postAuthorId, isFollowing: true },
                    })
                );
            }
        } finally {
            setFollowLoading(false);
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


    return (
        <>
            <article className="w-full bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <img
                            src={authorAvatar}
                            alt={authorUsername}
                            onClick={handleOpenProfile}
                            className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-gray-200 cursor-pointer hover:opacity-85 transition-opacity"
                            role="button"
                            tabIndex={0}
                            title={`View ${authorUsername}'s profile`}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    handleOpenProfile(e);
                                }
                            }}
                        />
                        <div className="min-w-0">
                            <button
                                type="button"
                                onClick={handleOpenProfile}
                                className="font-semibold text-sm text-gray-900 truncate hover:underline text-left block cursor-pointer"
                                title={`View ${authorUsername}'s profile`}
                            >
                                {authorUsername}
                            </button>
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
                        {!isOwnPost && postAuthorId && (
                            <button
                                type="button"
                                onClick={handleFollowButtonClick}
                                disabled={followLoading}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer select-none active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${isFollowing
                                        ? "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-red-600 border border-gray-200"
                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                                    }`}
                                title={isFollowing ? "Click to unfollow" : "Click to follow"}
                                aria-label={isFollowing ? `Following ${authorUsername}` : `Follow ${authorUsername}`}
                            >
                                {followLoading ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span>{isFollowing ? "Following" : "Follow"}</span>
                                    </span>
                                ) : isFollowing ? (
                                    "Following"
                                ) : (
                                    "Follow"
                                )}
                            </button>
                        )}

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
                        ></img>
                    ) : (
                        <div className="text-gray-400 text-sm">No image available</div>
                    )}

                    {showHeartBurst && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
                            <Heart size={90} className="fill-white text-white drop-shadow-2xl" />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-4 pt-3.5 pb-1">
                    <div className="flex items-center gap-4">
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

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="hover:scale-110 active:scale-95 transition-transform cursor-pointer disabled:opacity-60"
                        aria-label={saved ? "Unsave post" : "Save post"}
                        title={saved ? "Saved" : "Save post"}
                    >
                        <Bookmark
                            size={24}
                            className={saved ? "fill-black text-black" : "text-gray-800 hover:text-black"}
                        />
                    </button>
                </div>

                <div className="px-4 pt-2 pb-3.5 space-y-1.5">
                    {post.caption && (
                        <p className="text-sm text-gray-800 leading-5 break-words">
                            <button
                                type="button"
                                onClick={handleOpenProfile}
                                className="font-semibold text-gray-900 mr-2 hover:underline cursor-pointer inline"
                                title={`View ${authorUsername}'s profile`}
                            >
                                {authorUsername}
                            </button>
                            {post.caption}
                        </p>
                    )}

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

            {showUnfollowModal &&
                createPortal(
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                        onClick={() => setShowUnfollowModal(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="unfollow-modal-title"
                    >
                        <div
                            className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative mb-3.5">
                                <img
                                    src={authorAvatar}
                                    alt={authorUsername}
                                    className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-100 shadow-sm"
                                />
                            </div>

                            <h3
                                id="unfollow-modal-title"
                                className="text-lg font-bold text-gray-900 mb-1.5"
                            >
                                Unfollow @{authorUsername}?
                            </h3>

                            <p className="text-sm text-gray-500 mb-6 leading-relaxed px-1">
                                Are you sure you want to unfollow{" "}
                                <span className="font-semibold text-gray-800">
                                    @{authorUsername}
                                </span>
                                ? You won&apos;t see their latest posts in your feed anymore.
                            </p>

                            <div className="w-full flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={handleConfirmUnfollow}
                                    disabled={followLoading}
                                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    {followLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            <span>Unfollowing...</span>
                                        </>
                                    ) : (
                                        "Unfollow"
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowUnfollowModal(false)}
                                    disabled={followLoading}
                                    className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold text-sm rounded-xl transition duration-150 cursor-pointer disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

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
                    currentUser={{
                        ...currentUser,
                        avatar:
                            currentUser.profilePicture ||
                            currentUser.avatar ||
                            DEFAULT_USER.avatar,
                    }}
                    commentCount={commentCount}
                    onCommentCountChange={setCommentCount}
                    onClose={() => setShowComments(false)}
                />
            )}
        </>
    );
};

export default PostCard;