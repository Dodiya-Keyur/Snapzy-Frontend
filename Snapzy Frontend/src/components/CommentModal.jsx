import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Heart, Loader2, Trash2 } from "lucide-react";
import { formatTimeAgo } from "../utils/formatTime";
import api from "../api/axios";

const DEFAULT_AVATAR =
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face";

const CommentModal = ({
    post,
    currentUser,
    commentCount = 0,
    onCommentCountChange,
    onClose,
    onAddComment,
    onDeleteComment,
}) => {
    const [text, setText] = useState("");
    const [comments, setComments] = useState([]);
    const [repliesMap, setRepliesMap] = useState({}); // { [commentId]: Reply[] }
    const [expandedIds, setExpandedIds] = useState([]); // thread IDs where replies are visible
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null); // { id: parentCommentId, username: string }
    const [likedIds, setLikedIds] = useState([]);
    const [error, setError] = useState(null);

    const listEndRef = useRef(null);
    const inputRef = useRef(null);

    const postId = (post?._id || post?.id)?.toString();
    const postAuthorId = (post.user?._id || (typeof post.user === "string" ? post.user : ""))?.toString();
    const postAuthorUsername = post.user?.username || "";

    const currentUserId = (currentUser?._id || "")?.toString();
    const currentUsername = currentUser?.username || "";
    const currentUserAvatar =
        currentUser?.profilePicture || currentUser?.avatar || DEFAULT_AVATAR;

    const isOwnPost = Boolean(
        (currentUserId && postAuthorId && currentUserId === postAuthorId) ||
        (currentUsername && postAuthorUsername && currentUsername.toLowerCase() === postAuthorUsername.toLowerCase())
    );

    // Close on Escape + lock body scroll while modal is open
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        inputRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    // Fetch comments and their replies on modal open
    useEffect(() => {
        if (!postId) return;
        let isMounted = true;
        setLoading(true);
        setError(null);

        const fetchCommentsAndReplies = async () => {
            try {
                // 1. Fetch top-level comments for the post
                const res = await api.get(`/comments/posts/${postId}/comments`);
                if (!isMounted) return;

                const fetchedComments = res.data?.comments || [];
                setComments(fetchedComments);

                // 2. Fetch replies for each top-level comment in parallel
                const repliesResults = await Promise.all(
                    fetchedComments.map(async (c) => {
                        const cId = (c._id || c.id)?.toString();
                        if (!cId) return [cId, []];
                        try {
                            const rRes = await api.get(`/comments/comment/${cId}/replies`);
                            return [cId, rRes.data?.replies || []];
                        } catch (err) {
                            console.warn(`Failed to fetch replies for comment ${cId}:`, err);
                            return [cId, []];
                        }
                    })
                );

                if (!isMounted) return;
                const newRepliesMap = Object.fromEntries(repliesResults);
                setRepliesMap(newRepliesMap);

                // Calculate total count (top-level + all replies)
                const totalReplies = Object.values(newRepliesMap).reduce(
                    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
                    0
                );
                const totalCalculated = fetchedComments.length + totalReplies;

                // Sync total count with parent and other views
                if (onCommentCountChange) {
                    onCommentCountChange(totalCalculated);
                }
                window.dispatchEvent(
                    new CustomEvent("snapzy:comment-count-changed", {
                        detail: { postId, commentCount: totalCalculated },
                    })
                );
            } catch (err) {
                console.error("Failed to fetch comments:", err);
                if (isMounted) {
                    setError("Failed to load comments. Please try again.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCommentsAndReplies();

        return () => {
            isMounted = false;
        };
    }, [postId, onCommentCountChange]);

    // Broadcast count changes
    const notifyCountChange = (delta) => {
        if (onCommentCountChange) {
            onCommentCountChange((prev) => Math.max(0, prev + delta));
        }
        window.dispatchEvent(
            new CustomEvent("snapzy:comment-count-changed", {
                detail: { postId, delta },
            })
        );
    };

    // Start replying to a comment or a reply
    const startReply = (target, parentCommentId = null) => {
        const parentId = (parentCommentId || target.parentComment || target._id || target.id)?.toString();
        const username = target.user?.username || target.username || "user";

        setReplyingTo({
            id: parentId,
            username,
        });
        setText(`@${username} `);

        // Auto-expand replies for this comment so the user sees the thread
        if (parentId) {
            setExpandedIds((prev) =>
                prev.includes(parentId) ? prev : [...prev, parentId]
            );
        }

        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setText("");
    };

    const toggleReplies = async (commentId) => {
        if (expandedIds.includes(commentId)) {
            setExpandedIds((prev) => prev.filter((id) => id !== commentId));
            return;
        }

        // Expand
        setExpandedIds((prev) => [...prev, commentId]);

        // If replies not loaded yet, fetch them on demand
        if (!repliesMap[commentId]) {
            try {
                const rRes = await api.get(`/comments/comment/${commentId}/replies`);
                setRepliesMap((prev) => ({
                    ...prev,
                    [commentId]: rRes.data?.replies || [],
                }));
            } catch (err) {
                console.warn(`Failed to fetch replies for ${commentId}:`, err);
            }
        }
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setText(val);
        // If user clears the input completely, cancel the reply mode
        if (replyingTo && val === "") {
            setReplyingTo(null);
        }
    };

    // Post a new comment or reply
    const handleSubmit = async (e) => {
        e.preventDefault();
        const value = text.trim();
        if (!value || isEmpty || submitting || !postId) return;

        setSubmitting(true);
        setError(null);

        try {
            if (replyingTo?.id) {
                // Post a reply
                const res = await api.post(`/comments/comment/${replyingTo.id}/replies`, {
                    replytext: value,
                });

                const rawReply = res.data?.reply;
                const newReply = {
                    ...rawReply,
                    user: {
                        _id: currentUserId,
                        username: currentUsername || "me",
                        profilePicture: currentUserAvatar,
                    },
                };

                setRepliesMap((prev) => ({
                    ...prev,
                    [replyingTo.id]: [...(prev[replyingTo.id] || []), newReply],
                }));

                setExpandedIds((prev) =>
                    prev.includes(replyingTo.id) ? prev : [...prev, replyingTo.id]
                );

                notifyCountChange(1);
                if (onAddComment) onAddComment(value, replyingTo.id);

                setReplyingTo(null);
                setText("");
            } else {
                // Post a top-level comment
                const res = await api.post(`/comments/posts/${postId}/comments`, {
                    commentText: value,
                });

                const rawComment = res.data?.comment;
                const newComment = {
                    ...rawComment,
                    user: {
                        _id: currentUserId,
                        username: currentUsername || "me",
                        profilePicture: currentUserAvatar,
                    },
                };

                setComments((prev) => [...prev, newComment]);
                setRepliesMap((prev) => ({
                    ...prev,
                    [newComment._id]: [],
                }));

                notifyCountChange(1);
                if (onAddComment) onAddComment(value, null);

                setText("");

                // Scroll to newest comment
                setTimeout(() => {
                    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        } catch (err) {
            console.error("Failed to post comment/reply:", err);
            setError(
                err.response?.data?.message || "Failed to post comment. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Delete a comment or reply
    const handleDelete = async (item, parentCommentId = null) => {
        const commentId = (item._id || item.id)?.toString();
        if (!commentId || deletingId) return;

        setDeletingId(commentId);
        setError(null);

        try {
            await api.delete(`/comments/comment/${commentId}`);

            if (parentCommentId) {
                // Deleted a reply
                setRepliesMap((prev) => ({
                    ...prev,
                    [parentCommentId]: (prev[parentCommentId] || []).filter(
                        (r) => (r._id || r.id)?.toString() !== commentId
                    ),
                }));
                notifyCountChange(-1);
            } else {
                // Deleted a top-level comment
                const repliesCount = repliesMap[commentId]?.length || 0;
                setComments((prev) =>
                    prev.filter((c) => (c._id || c.id)?.toString() !== commentId)
                );
                setRepliesMap((prev) => {
                    const copy = { ...prev };
                    delete copy[commentId];
                    return copy;
                });
                // Decrement count by 1 (or 1 + replies)
                notifyCountChange(-1 - repliesCount);
            }

            if (onDeleteComment) onDeleteComment(commentId);
        } catch (err) {
            console.error("Failed to delete comment:", err);
            setError(err.response?.data?.message || "Failed to delete comment.");
        } finally {
            setDeletingId(null);
        }
    };

    // Permission check for delete: allowed by comment author OR post owner
    const canDelete = (item) => {
        const authorId = (item.user?._id || (typeof item.user === "string" ? item.user : ""))?.toString();
        const authorName = item.user?.username || item.username || "";

        const isCommentAuthor = Boolean(
            (currentUserId && authorId && currentUserId === authorId) ||
            (currentUsername && authorName && currentUsername.toLowerCase() === authorName.toLowerCase())
        );

        return isCommentAuthor || isOwnPost;
    };

    const toggleCommentLike = (id) => {
        setLikedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Input only has "@username" mention and nothing else
    const isEmpty =
        !text.trim() ||
        (replyingTo && text.trim() === `@${replyingTo.username}`);

    // Helper to render mention styled differently if comment/reply starts with @username
    const renderCommentText = (commentText) => {
        if (!commentText) return null;
        const mentionMatch = commentText.match(/^(@[a-zA-Z0-9_.-]+)\s*(.*)$/);
        if (mentionMatch) {
            return (
                <>
                    <span className="font-semibold text-blue-600 mr-1">
                        {mentionMatch[1]}
                    </span>
                    <span>{mentionMatch[2]}</span>
                </>
            );
        }
        return <span>{commentText}</span>;
    };

    // Render a single comment or reply item
    const renderItem = (item, isReply = false, parentCommentId = null) => {
        const itemId = (item._id || item.id)?.toString();
        const itemUser = item.user || {};
        const authorName = itemUser.username || item.username || "user";
        const authorAvatar =
            itemUser.profilePicture ||
            itemUser.avatar ||
            item.avatar ||
            DEFAULT_AVATAR;
        const itemContent = item.commentText || item.text || "";
        const isDeleting = deletingId === itemId;
        const isLiked = likedIds.includes(itemId);

        return (
            <div key={itemId} className="flex items-start gap-3 group">
                {/* Avatar */}
                <img
                    src={authorAvatar}
                    alt={authorName}
                    className={`rounded-full object-cover shrink-0 ring-1 ring-gray-200 ${isReply ? "w-6 h-6 mt-0.5" : "w-8 h-8"
                        }`}
                />

                {/* Content & Actions */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-5 break-words">
                        <span className="font-semibold text-gray-900 mr-1.5 hover:underline cursor-pointer">
                            {authorName}
                        </span>
                        {renderCommentText(itemContent)}
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{formatTimeAgo(item.createdAt)}</span>

                        {/* Reply button */}
                        <button
                            type="button"
                            onClick={() => startReply(item, parentCommentId)}
                            className="font-semibold hover:text-gray-800 cursor-pointer transition"
                        >
                            Reply
                        </button>

                        {/* Delete button (visible if user is comment creator or post owner) */}
                        {canDelete(item) && (
                            <button
                                type="button"
                                onClick={() => handleDelete(item, parentCommentId)}
                                disabled={isDeleting}
                                className="font-semibold text-gray-400 hover:text-red-600 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Delete comment"
                            >
                                {isDeleting ? (
                                    <span className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 size={12} />
                                        <span>Delete</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Like Button */}
                <button
                    type="button"
                    onClick={() => toggleCommentLike(itemId)}
                    className="p-1 shrink-0 text-gray-400 hover:text-red-500 transition cursor-pointer"
                    aria-label="Like comment"
                >
                    <Heart
                        size={14}
                        className={isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}
                    />
                </button>
            </div>
        );
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Comments"
        >
            <div
                className="flex w-full md:max-w-4xl h-[85vh] md:h-[80vh] bg-white rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left: post image (desktop only) */}
                <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center overflow-hidden">
                    {post.image ? (
                        <img
                            src={post.image}
                            alt={post.caption || "Post preview"}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-gray-400 text-sm p-6 text-center">
                            No image available
                        </div>
                    )}
                </div>

                {/* Right: comments list and input */}
                <div className="flex flex-col w-full md:w-1/2 min-w-0 bg-white">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <img
                                src={
                                    post.user?.profilePicture ||
                                    post.user?.avatar ||
                                    DEFAULT_AVATAR
                                }
                                alt={post.user?.username || "user"}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200"
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {post.user?.username || "user"}
                                </p>
                                {post.location && (
                                    <p className="text-xs text-gray-500 truncate capitalize">
                                        {post.location}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                            aria-label="Close comments"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Error Notice */}
                    {error && (
                        <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center justify-between text-xs text-red-700">
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={() => setError(null)}
                                className="text-red-500 hover:text-red-700 ml-2"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {/* Caption as first item */}
                        {post.caption && (
                            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                                <img
                                    src={
                                        post.user?.profilePicture ||
                                        post.user?.avatar ||
                                        DEFAULT_AVATAR
                                    }
                                    alt={post.user?.username || "user"}
                                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-800 leading-5 break-words">
                                        <span className="font-semibold text-gray-900 mr-1.5 hover:underline cursor-pointer">
                                            {post.user?.username || "user"}
                                        </span>
                                        {post.caption}
                                    </p>
                                    <span className="text-xs text-gray-500 mt-1 block">
                                        {formatTimeAgo(post.createdAt)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Loading spinner */}
                        {loading && (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                                <Loader2 size={24} className="animate-spin text-blue-600" />
                                <span className="text-xs text-gray-500">Loading comments...</span>
                            </div>
                        )}

                        {/* Empty comments placeholder */}
                        {!loading && comments.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-base font-semibold text-gray-800">
                                    No comments yet.
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Start the conversation.
                                </p>
                            </div>
                        )}

                        {/* Comments & Replies list */}
                        {!loading &&
                            comments.map((c) => {
                                const cId = (c._id || c.id)?.toString();
                                const replies = repliesMap[cId] || [];
                                const isExpanded = expandedIds.includes(cId);

                                return (
                                    <div key={cId} className="space-y-2">
                                        {/* Top-level comment */}
                                        {renderItem(c, false, null)}

                                        {/* Replies toggle button & list */}
                                        {replies.length > 0 && (
                                            <div className="ml-11">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleReplies(cId)}
                                                    className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition py-0.5 cursor-pointer"
                                                >
                                                    <span className="inline-block w-6 border-t border-gray-300" />
                                                    {isExpanded
                                                        ? "Hide replies"
                                                        : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"
                                                        }`}
                                                </button>

                                                {/* Expanded replies thread */}
                                                {isExpanded && (
                                                    <div className="mt-2.5 space-y-3 border-l-2 border-gray-100 pl-3">
                                                        {replies.map((r) =>
                                                            renderItem(r, true, cId)
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                        <div ref={listEndRef} />
                    </div>

                    {/* Replying-to status bar */}
                    {replyingTo && (
                        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-600 bg-gray-50 border-t border-gray-200 shrink-0">
                            <span className="truncate">
                                Replying to{" "}
                                <span className="font-semibold text-blue-600">
                                    @{replyingTo.username}
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={cancelReply}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                                aria-label="Cancel reply"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Comment/Reply Input Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 shrink-0 bg-white"
                    >
                        <img
                            src={currentUserAvatar}
                            alt="You"
                            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={handleChange}
                            placeholder={
                                replyingTo
                                    ? `Reply to @${replyingTo.username}...`
                                    : "Add a comment..."
                            }
                            className="flex-1 min-w-0 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                            disabled={submitting}
                            maxLength={500}
                        />
                        <button
                            type="submit"
                            disabled={isEmpty || submitting}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
                        >
                            {submitting ? (
                                <Loader2 size={16} className="animate-spin text-blue-600" />
                            ) : (
                                "Post"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CommentModal;