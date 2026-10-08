import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  MapPin,
} from "lucide-react";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
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

            <p className="text-xs text-gray-500">
              {post.createdAt}
            </p>
          </div>
        </div>

        <button
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Post options"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Image */}
      <div className="w-full aspect-square bg-gray-100">
        <img
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            className="hover:scale-110 transition-transform"
            aria-label="Like post"
          >
            <Heart
              size={24}
              className={
                liked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-800"
              }
            />
          </button>

          {/* Comment */}
          <button
            className="hover:scale-110 transition-transform"
            aria-label="Comment"
          >
            <MessageCircle
              size={24}
              className="text-gray-800"
            />
          </button>

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
            className={
              saved
                ? "fill-black text-black"
                : "text-gray-800"
            }
          />
        </button>
      </div>

      {/* Likes */}
      <div className="px-4 pt-3">
        <p className="text-sm font-semibold text-gray-900">
          {likes.toLocaleString()} likes
        </p>
      </div>

      {/* Caption */}
      <div className="px-4 pt-2">
        <p className="text-sm text-gray-800 leading-5">
          <span className="font-semibold mr-2">
            {post.user.username}
          </span>

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
      </div>

      {/* Comments */}
      {post.comments > 0 && (
        <button className="px-4 pt-2 pb-4 text-sm text-gray-500 hover:text-gray-700">
          View all {post.comments} comments
        </button>
      )}
    </article>
  );
};

export default PostCard;