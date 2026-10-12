import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Image as ImageIcon,
  LoaderCircle,
  X,
  User,
  MessageCircle,
  Calendar,
} from "lucide-react";
import api from "../api/axios";

function LikedPost() {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [unlikingId, setUnlikingId] = useState(null);

  useEffect(() => {
    fetchLikedPosts();
  }, []);

  const fetchLikedPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/me/liked-post");

      // Backend returns { message: "...", likedPost: [...] }
      const posts =
        response.data?.likedPost ??
        response.data?.likedPosts ??
        response.data?.posts ??
        response.data?.data ??
        [];

      setLikedPosts(Array.isArray(posts) ? posts : []);
    } catch (err) {
      console.error("Error fetching liked posts:", err);
      // Graceful error or empty state
      if (err.response?.status === 401) {
        setLikedPosts([]);
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load liked posts. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getImage = (post) => {
    return (
      post?.image?.url ||
      post?.imageUrl ||
      post?.image ||
      post?.media?.[0]?.url ||
      post?.media?.[0] ||
      ""
    );
  };

  const getPostId = (item) => item?.post?._id || item?._id || item?.id;

  const getPost = (item) => item?.post || item;

  const handleUnlike = async (e, item) => {
    e.stopPropagation();
    const postId = getPostId(item);
    if (!postId || unlikingId) return;

    try {
      setUnlikingId(postId);
      // Call backend unlike endpoint
      await api.delete(`/posts/${postId}/unlike`);
    } catch (err) {
      console.warn("Backend unlike request failed, removing locally:", err);
    } finally {
      // Remove from local list
      setLikedPosts((prev) =>
        prev.filter((p) => getPostId(p) !== postId)
      );
      if (selectedPost && getPostId(selectedPost) === postId) {
        setSelectedPost(null);
      }
      setUnlikingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="mb-8 flex items-center gap-4 border-b border-gray-200 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
            <Heart size={27} className="fill-rose-500 text-rose-500" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Liked Posts
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              All the posts you've liked in one place.
            </p>
          </div>
        </div>

        {/* Post Count */}
        {!loading && !error && (
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Your collection
            </h2>

            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
              {likedPosts.length}{" "}
              {likedPosts.length === 1 ? "post" : "posts"}
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3">
            <LoaderCircle
              size={34}
              className="animate-spin text-gray-800"
            />
            <p className="text-sm text-gray-500">
              Loading your liked posts...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-xs">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={fetchLikedPosts}
              className="mt-4 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State (Styled exactly like Saved Posts) */}
        {!loading && !error && likedPosts.length === 0 && (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-300 text-gray-400">
              <Heart size={35} strokeWidth={1.5} />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              No liked posts yet
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Posts you like will appear here. Tap the heart on posts
              you love so you can find them anytime.
            </p>

            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-95"
            >
              Explore Feed
            </Link>
          </div>
        )}

        {/* Liked Posts Grid */}
        {!loading && !error && likedPosts.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {likedPosts.map((item, index) => {
              const post = getPost(item);
              const image = getImage(post);
              const postId = getPostId(item) || index;

              return (
                <div
                  key={postId}
                  onClick={() => setSelectedPost(item)}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-gray-200 sm:rounded-2xl"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={post?.caption || "Liked post"}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon
                        size={36}
                        className="text-gray-400"
                      />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/20 to-transparent p-3 opacity-100 transition sm:p-4 sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-1.5">
                        <Heart
                          size={16}
                          className="fill-rose-500 text-rose-500"
                        />
                        <span className="text-xs font-semibold sm:text-sm">
                          Liked post
                        </span>
                      </div>

                      {/* Quick Unlike on Hover */}
                      <button
                        type="button"
                        onClick={(e) => handleUnlike(e, item)}
                        title="Unlike"
                        className="rounded-full bg-white/20 p-1.5 backdrop-blur-md transition hover:bg-white/40 active:scale-90"
                      >
                        <Heart
                          size={14}
                          className="fill-white text-white"
                        />
                      </button>
                    </div>

                    {post?.caption && (
                      <p className="mt-1 line-clamp-2 text-xs text-white/90 sm:text-sm">
                        {post.caption}
                      </p>
                    )}
                  </div>

                  {/* Heart Indicator Badge */}
                  <div className="absolute right-2 top-2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm shadow-xs">
                    <Heart
                      size={15}
                      className="fill-rose-500 text-rose-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <Heart size={16} className="fill-rose-500" />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Liked Post
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative aspect-video max-h-[60vh] w-full bg-black flex items-center justify-center">
              {getImage(getPost(selectedPost)) ? (
                <img
                  src={getImage(getPost(selectedPost))}
                  alt={getPost(selectedPost)?.caption || "Post"}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <ImageIcon size={48} className="text-gray-500" />
              )}
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-3 p-4">
              {getPost(selectedPost)?.caption && (
                <p className="text-sm text-gray-800">
                  {getPost(selectedPost).caption}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={(e) => handleUnlike(e, selectedPost)}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 active:scale-95"
                >
                  <Heart size={16} className="fill-rose-600" />
                  Unlike post
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LikedPost;
