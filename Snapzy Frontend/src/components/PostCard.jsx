import { useState } from "react";
import {
    Heart,
    MessageCircle,
    Send,
    Bookmark,
    MoreHorizontal,
    MapPin,
} from "lucide-react";
import CommentModal from "./CommentModal";

const DEFAULT_USER = {
    id: 1,
    username: "keyur",
    avatar: "https://i.pravatar.cc/100?img=12",
};

const PostCard = ({ post, currentUser = DEFAULT_USER }) => {
    const [liked, setLiked] = useState(post.liked);
    const [saved, setSaved] = useState(post.saved);
    const [likes, setLikes] = useState(post.likes);
    const [isFollowing, setIsFollowing] = useState(post.user.isFollowing ?? false);

    // Comments
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(post.commentsList ?? []);

    const addedCount = comments.length - (post.commentsList?.length ?? 0);
    const commentCount = post.comments + addedCount;

    const handleLike = () => {
        setLiked(!liked);
        setLikes((prev) => (liked ? prev - 1 : prev + 1));
    };

    const handleAddComment = (text, parentId = null) => {
        setComments((prev) => [
            ...prev,
            {
                id: Date.now(),
                parentId, // null = top-level comment, otherwise a reply
                username: currentUser.username,
                avatar: currentUser.avatar,
                text,
                createdAt: "Just now",
            },
        ]);
    };

    const handleDeleteComment = (id) => {
        // Delete the comment and any replies attached to it
        setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
    };

    return (
        <>
            <article className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <img
                            src={post.user.avatar}
                            alt={post.user.username}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold text-sm text-gray-900">
                                {post.user.username}
                            </p>
                            <p className="text-xs text-gray-500">{post.createdAt}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFollowing((prev) => !prev)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition ${isFollowing
                                ? "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </button>

                        <button
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                            aria-label="Post options"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </div>

                {/* Post Image */}
                <div className="w-full aspect-[6/4] bg-gray-100">
                    <img
                        src={post.image}
                        alt={post.caption}
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-4 pt-3">
                    <div className="flex items-center gap-4">
                        {/* Like */}
                        <div className="flex">
                            <button
                                onClick={handleLike}
                                className="hover:scale-110 transition-transform"
                                aria-label="Like post"
                            >
                                <Heart
                                    size={24}
                                    className={liked ? "fill-red-500 text-red-500" : "text-gray-800"}
                                />
                            </button>
                            <p className="ml-1 text-sm font-semibold text-gray-900">
                                {likes.toLocaleString()}
                            </p>
                        </div>

                        {/* Comment -> opens popup */}
                        <div className="flex">
                            <button
                                onClick={() => setShowComments(true)}
                                className="hover:scale-110 transition-transform"
                                aria-label="Open comments"
                            >
                                <MessageCircle size={24} className="text-gray-800" />
                            </button>
                            <p className="ml-1 text-sm font-semibold text-gray-900">
                                {commentCount.toLocaleString()}
                            </p>
                        </div>

                        {/* Share */}
                        <button
                            className="hover:scale-110 transition-transform"
                            aria-label="Share"
                        >
                            <Send size={24} className="text-gray-800" />
                        </button>
                    </div>

                    {/* Save */}
                    <button
                        onClick={() => setSaved(!saved)}
                        className="hover:scale-110 transition-transform"
                        aria-label="Save post"
                    >
                        <Bookmark
                            size={24}
                            className={saved ? "fill-black text-black" : "text-gray-800"}
                        />
                    </button>
                </div>

                {/* Caption */}
                <div className="px-4 pt-2 mb-3">
                    <p className="text-sm text-gray-800 leading-5">
                        <span className="font-semibold mr-2">{post.user.username}</span>
                        {post.caption}
                    </p>

                    {post.location && (
                        <div className="flex items-start gap-1.5 text-sm text-gray-700 pt-2">
                            <MapPin
                                className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gray-600"
                                strokeWidth={2}
                            />
                            <p className="leading-5">{post.location}</p>
                        </div>
                    )}

                    {commentCount > 0 && (
                        <button
                            onClick={() => setShowComments(true)}
                            className="pt-2 text-sm text-gray-500 hover:text-gray-700 transition"
                        >
                            View all {commentCount.toLocaleString()} comments
                        </button>
                    )}
                </div>
            </article>

            {/* Comments popup */}
            {showComments && (
                <CommentModal
                    post={post}
                    comments={comments}
                    currentUser={currentUser}
                    onClose={() => setShowComments(false)}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                />
            )}
        </>
    );
};

export default PostCard;