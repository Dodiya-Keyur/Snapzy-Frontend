import RightSidebar from "../components/RightSidebar";
import PostFeed from "../components/PostFeed";
import api from "../api/axios";
import { useEffect, useState } from "react";
import SkeletonLoader from "../components/SkeletonLoader";

function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            setLoading(true);

            // Fetch feed and user relationships in parallel so all states are ready before rendering
            const [feedRes, followingRes, savedRes] = await Promise.allSettled([
                api.get("/posts/feed"),
                api.get("/users/me/following"),
                api.get("/users/me/saved-posts"),
            ]);

            const feedPosts =
                feedRes.status === "fulfilled"
                    ? feedRes.value.data?.posts ?? feedRes.value.data ?? []
                    : [];

            const rawPosts = Array.isArray(feedPosts) ? feedPosts : [];

            // Extract following IDs
            let followingSet = new Set();
            if (followingRes.status === "fulfilled") {
                const list = followingRes.value.data?.following || [];
                followingSet = new Set(
                    list
                        .map((item) =>
                            (
                                item.following?._id ||
                                item.following ||
                                item._id ||
                                item
                            )?.toString()
                        )
                        .filter(Boolean)
                );
            }

            // Extract saved IDs
            let savedSet = new Set();
            if (savedRes.status === "fulfilled") {
                const list =
                    savedRes.value.data?.savedPosts ??
                    savedRes.value.data?.data?.savedPosts ??
                    savedRes.value.data?.posts ??
                    [];
                savedSet = new Set(
                    list
                        .map((item) =>
                            (
                                item?._id ||
                                item?.post?._id ||
                                item
                            )?.toString()
                        )
                        .filter(Boolean)
                );
            }

            // Check if any post is missing isLiked status
            const needsLikeFetch = rawPosts.filter(
                (p) => typeof p.isLiked !== "boolean" && p._id
            );

            let likeMap = new Map();
            if (needsLikeFetch.length > 0) {
                const likeResults = await Promise.allSettled(
                    needsLikeFetch.map((p) =>
                        api.get(`/posts/${p._id}/isliked`).then((r) => ({
                            id: p._id.toString(),
                            isLiked: r.data?.isLiked,
                            likesCount: r.data?.likesCount,
                        }))
                    )
                );
                likeResults.forEach((r) => {
                    if (r.status === "fulfilled" && r.value) {
                        likeMap.set(r.value.id, r.value);
                    }
                });
            }

            // Enrich all posts completely BEFORE displaying
            const fullyEnrichedPosts = rawPosts.map((post) => {
                const pId = (post._id || post.id)?.toString();
                const authorId = (
                    post.user?._id ||
                    post.user?.id ||
                    post.user
                )?.toString();

                const isLiked =
                    typeof post.isLiked === "boolean"
                        ? post.isLiked
                        : (likeMap.get(pId)?.isLiked ?? Boolean(post.liked));

                const likesCount =
                    typeof post.likesCount === "number"
                        ? post.likesCount
                        : (likeMap.get(pId)?.likesCount ??
                          Math.max(0, post.likes ?? 0));

                const isFollowing =
                    typeof post.user?.isFollowing === "boolean"
                        ? post.user.isFollowing
                        : (authorId ? followingSet.has(authorId) : false);

                const isSaved =
                    typeof post.isSaved === "boolean"
                        ? post.isSaved
                        : (pId ? savedSet.has(pId) : false);

                const commentCount = Number(
                    post.commentCount ??
                    post.commentsCount ??
                    post.totalComments ??
                    (Array.isArray(post.comments) ? post.comments.length : undefined) ??
                    (typeof post.comments === "number" ? post.comments : 0)
                ) || 0;

                return {
                    ...post,
                    isLiked,
                    likesCount,
                    isSaved,
                    commentCount,
                    user:
                        typeof post.user === "object" && post.user !== null
                            ? { ...post.user, isFollowing }
                            : post.user,
                };
            });

            setPosts(fullyEnrichedPosts);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) {
        return <SkeletonLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 mt-[-30px] md:mt-1">
            <main>
                <div className="mx-auto flex max-w-[1200px] items-start justify-center gap-20 px-4 py-6 sm:px-6 lg:px-8">
                    {/* Post Feed */}
                    <section className="w-full max-w-[650px]">
                        <PostFeed posts={posts} onRefresh={fetchPosts} />
                    </section>

                    {/* Right Sidebar */}
                    <aside className="hidden xl:block w-[320px] shrink-0">
                        <RightSidebar />
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default Home;