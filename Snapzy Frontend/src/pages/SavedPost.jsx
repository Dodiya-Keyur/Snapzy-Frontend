import { useEffect, useState } from "react";
import { Bookmark, Image as ImageIcon, LoaderCircle } from "lucide-react";
import api from "../api/axios";

function SavedPost() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/me/saved-posts");

      // Adjust according to backend response structure
      const posts =
        response.data?.savedPosts ??
        response.data?.data?.savedPosts ??
        response.data?.posts ??
        response.data?.data ??
        [];

      setSavedPosts(Array.isArray(posts) ? posts : []);
    } catch (err) {
      console.error("Error fetching saved posts:", err);
      if (err.response?.status === 401) {
        setSavedPosts([]);
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to load saved posts. Please try again."
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

  const getPostId = (post) => post?._id || post?.post?._id;

  const getPost = (item) => item?.post || item;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="mb-8 flex items-center gap-4 border-b border-gray-200 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white">
            <Bookmark size={27} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Saved Posts
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              All the posts you've saved in one place.
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
              {savedPosts.length}{" "}
              {savedPosts.length === 1 ? "post" : "posts"}
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
              Loading your saved posts...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={fetchSavedPosts}
              className="mt-4 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && savedPosts.length === 0 && (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-300">
              <Bookmark size={35} strokeWidth={1.5} />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Save your favorite posts
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Posts you save will appear here. Bookmark posts
              you love so you can find them anytime.
            </p>
          </div>
        )}

        {/* Saved Posts Grid */}
        {!loading && !error && savedPosts.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {savedPosts.map((item, index) => {
              const post = getPost(item);
              const image = getImage(post);
              const postId = getPostId(item) || index;

              return (
                <div
                  key={postId}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-gray-200 sm:rounded-2xl"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={post?.caption || "Saved post"}
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
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-100 transition sm:p-4 sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="flex items-center gap-2 text-white">
                      <Bookmark
                        size={16}
                        fill="currentColor"
                      />
                      <span className="text-xs font-semibold sm:text-sm">
                        Saved post
                      </span>
                    </div>

                    {post?.caption && (
                      <p className="mt-1 line-clamp-2 text-xs text-white/90 sm:text-sm">
                        {post.caption}
                      </p>
                    )}
                  </div>

                  {/* Bookmark Indicator */}
                  <div className="absolute right-2 top-2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm">
                    <Bookmark
                      size={15}
                      fill="currentColor"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedPost;
