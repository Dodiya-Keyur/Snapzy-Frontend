import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Image as ImageIcon,
  LoaderCircle,
  LayoutGrid,
  List,
  X,
} from "lucide-react";
import api from "../api/axios";
import PostCard from "../components/PostCard";

function SavedPost() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  useEffect(() => {
    const handleSavedChange = (e) => {
      if (e.detail?.postId && e.detail.isSaved === false) {
        setSavedPosts((prev) =>
          prev.filter((item) => {
            const pid = (item?._id || item?.post?._id || item)?.toString();
            return pid !== e.detail.postId.toString();
          })
        );
        if (
          selectedPost &&
          (selectedPost._id || selectedPost.post?._id)?.toString() ===
            e.detail.postId.toString()
        ) {
          setSelectedPost(null);
        }
      } else if (e.detail?.postId && e.detail.isSaved === true) {
        fetchSavedPosts();
      }
    };

    window.addEventListener("snapzy:saved-changed", handleSavedChange);
    return () => {
      window.removeEventListener("snapzy:saved-changed", handleSavedChange);
    };
  }, [selectedPost]);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/me/saved-posts");

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
    <div className="min-h-screen bg-gray-50 px-4 py-6 lg:px-8 mt-[-25px] md:mt-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
              <Bookmark size={27} className="fill-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Saved Posts
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                All the posts you&apos;ve saved in one place.
              </p>
            </div>
          </div>
        </div>

        {!loading && !error && savedPosts.length > 0 && (
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-700">
                Your collection
              </h2>
              <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {savedPosts.length}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-gray-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Grid view"
              >
                <LayoutGrid size={15} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("feed")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  viewMode === "feed"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="PostCard view"
              >
                <List size={15} />
                <span className="hidden sm:inline">Feed</span>
              </button>
            </div>
          </div>
        )}

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

        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-xs">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={fetchSavedPosts}
              className="mt-4 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && savedPosts.length === 0 && (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-center shadow-xs">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-300 text-gray-400">
              <Bookmark size={35} strokeWidth={1.5} />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Save your favorite posts
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Posts you save will appear here. Bookmark posts
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

        {!loading && !error && savedPosts.length > 0 && viewMode === "feed" && (
          <div className="mx-auto flex max-w-[650px] flex-col gap-6">
            {savedPosts.map((item) => {
              const post = getPost(item);
              const postId = getPostId(item);
              return <PostCard key={postId} post={post} />;
            })}
          </div>
        )}

        {!loading && !error && savedPosts.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {savedPosts.map((item, index) => {
              const post = getPost(item);
              const image = getImage(post);
              const postId = getPostId(item) || index;

              return (
                <div
                  key={postId}
                  onClick={() => setSelectedPost(post)}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-gray-200 sm:rounded-2xl transition hover:shadow-md"
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

                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-100 transition sm:p-4 sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="flex items-center gap-2 text-white">
                      <Bookmark
                        size={16}
                        fill="currentColor"
                      />
                      <span className="text-xs font-semibold sm:text-sm">
                        View post
                      </span>
                    </div>

                    {post?.caption && (
                      <p className="mt-1 line-clamp-2 text-xs text-white/90 sm:text-sm">
                        {post.caption}
                      </p>
                    )}
                  </div>

                  <div className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm shadow-xs">
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

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-lg max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-white">
              <div className="flex items-center gap-2">
                <Bookmark size={16} className="fill-black text-black" />
                <span className="text-sm font-semibold text-gray-900">
                  Saved Post
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-2 sm:p-4 bg-gray-50">
              <PostCard post={selectedPost} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedPost;
