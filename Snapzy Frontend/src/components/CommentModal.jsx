import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Heart } from "lucide-react";

const CommentModal = ({
    post,
    comments,
    currentUser,
    onClose,
    onAddComment,
    onDeleteComment,
}) => {
    const [text, setText] = useState("");
    const [likedIds, setLikedIds] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null); // { id, username }
    const [expandedIds, setExpandedIds] = useState([]); // threads with replies visible
    const listEndRef = useRef(null);
    const inputRef = useRef(null);

    const me = currentUser.username;

    // Top-level comments and their replies
    const topLevel = comments.filter((c) => !c.parentId);
    const repliesOf = (id) => comments.filter((c) => c.parentId === id);

    // Close on Escape + lock body scroll while open
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

    // Scroll to newest comment when one is added
    useEffect(() => {
        listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments.length]);

    const startReply = (c) => {
        // Replies to a reply attach to the same top-level comment (like Instagram)
        const parentId = c.parentId ?? c.id;
        setReplyingTo({ id: parentId, username: c.username });
        setText(`@${c.username} `);
        setExpandedIds((prev) =>
            prev.includes(parentId) ? prev : [...prev, parentId]
        );
        inputRef.current?.focus();
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setText("");
    };

    const toggleReplies = (id) =>
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const handleChange = (e) => {
        const value = e.target.value;
        setText(value);
        // Clearing the input cancels the reply
        if (replyingTo && value === "") setReplyingTo(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const value = text.trim();
        if (!value || isEmpty) return;

        onAddComment(value, replyingTo?.id ?? null);

        if (replyingTo) {
            setExpandedIds((prev) =>
                prev.includes(replyingTo.id) ? prev : [...prev, replyingTo.id]
            );
        }
        setReplyingTo(null);
        setText("");
    };

    const toggleCommentLike = (id) =>
        setLikedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    // Input only has the "@username" mention and nothing else
    const isEmpty =
        !text.trim() ||
        (replyingTo && text.trim() === `@${replyingTo.username}`);

    const renderComment = (c, isReply = false) => (
        <div key={c.id} className="flex items-start gap-3">
            <img
                src={c.avatar}
                alt={c.username}
                className={`rounded-full object-cover shrink-0 ${isReply ? "w-6 h-6" : "w-8 h-8"
                    }`}
            />

            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-5 break-words">
                    <span className="font-semibold mr-2">{c.username}</span>
                    {c.text}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500">{c.createdAt}</span>
                    <button
                        onClick={() => startReply(c)}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
                    >
                        Reply
                    </button>
                    {c.username === me && (
                        <button
                            onClick={() => onDeleteComment(c.id)}
                            className="text-xs font-semibold text-gray-500 hover:text-red-500 transition"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <button
                onClick={() => toggleCommentLike(c.id)}
                className="p-1 shrink-0"
                aria-label="Like comment"
            >
                <Heart
                    size={14}
                    className={
                        likedIds.includes(c.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-500"
                    }
                />
            </button>
        </div>
    );

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Comments"
        >
            <div
                className="flex w-full md:max-w-4xl h-[85vh] md:h-[80vh] bg-white rounded-t-2xl md:rounded-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left: image (desktop only) */}
                <div className="hidden md:block md:w-1/2 bg-black">
                    <img
                        src={post.image}
                        alt={post.caption}
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Right: comments */}
                <div className="flex flex-col w-full md:w-1/2 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <img
                                src={post.user.avatar}
                                alt={post.user.username}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <p className="text-sm font-semibold text-gray-900">
                                {post.user.username}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition"
                            aria-label="Close comments"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {/* Caption as first item */}
                        {post.caption && (
                            <div className="flex items-start gap-3">
                                <img
                                    src={post.user.avatar}
                                    alt={post.user.username}
                                    className="w-8 h-8 rounded-full object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-800 leading-5 break-words">
                                        <span className="font-semibold mr-2">
                                            {post.user.username}
                                        </span>
                                        {post.caption}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                        {post.createdAt}
                                    </span>
                                </div>
                            </div>
                        )}

                        {topLevel.length === 0 && (
                            <div className="py-10 text-center">
                                <p className="text-lg font-semibold text-gray-900">
                                    No comments yet.
                                </p>
                                <p className="text-sm text-gray-500">
                                    Start the conversation.
                                </p>
                            </div>
                        )}

                        {topLevel.map((c) => {
                            const replies = repliesOf(c.id);
                            const expanded = expandedIds.includes(c.id);

                            return (
                                <div key={c.id}>
                                    {renderComment(c)}

                                    {replies.length > 0 && (
                                        <div className="ml-11 mt-2">
                                            <button
                                                onClick={() => toggleReplies(c.id)}
                                                className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition"
                                            >
                                                <span className="inline-block w-6 border-t border-gray-300" />
                                                {expanded
                                                    ? "Hide replies"
                                                    : `View ${replies.length} ${replies.length === 1
                                                        ? "reply"
                                                        : "replies"
                                                    }`}
                                            </button>

                                            {expanded && (
                                                <div className="mt-3 space-y-3">
                                                    {replies.map((r) =>
                                                        renderComment(r, true)
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

                    {/* Replying-to bar */}
                    {replyingTo && (
                        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-600 bg-gray-50 border-t border-gray-200">
                            <span>
                                Replying to{" "}
                                <span className="font-semibold">
                                    @{replyingTo.username}
                                </span>
                            </span>
                            <button
                                onClick={cancelReply}
                                className="p-1 rounded-full hover:bg-gray-200 transition"
                                aria-label="Cancel reply"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Add comment */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center gap-3 px-4 py-3 border-t border-gray-200"
                    >
                        <img
                            src={currentUser.avatar}
                            alt="You"
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={handleChange}
                            placeholder={
                                replyingTo
                                    ? `Reply to ${replyingTo.username}...`
                                    : "Add a comment..."
                            }
                            className="flex-1 min-w-0 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isEmpty}
                            className="text-sm font-semibold text-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Post
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CommentModal;