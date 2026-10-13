import PostCard from "./PostCard";
import { Sparkles, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const PostFeed = ({ posts = [], onRefresh }) => {
    if (!posts || posts.length === 0) {
        return (
            <div className="w-full bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 text-blue-600 mb-4">
                    <Sparkles size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Your feed is quiet</h3>
                <p className="mt-1.5 max-w-sm mx-auto text-sm text-gray-500">
                    Follow other creators or share your first post to start seeing photos and updates here!
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        to="/create-post"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                    >
                        Create Post
                    </Link>
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                        >
                            <RefreshCw size={15} />
                            Refresh
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <main className="w-full">
            <div className="flex flex-col gap-6">
                {posts.map((post) => (
                    <PostCard key={post._id || post.id} post={post} />
                ))}
            </div>
        </main>
    );
};

export default PostFeed;