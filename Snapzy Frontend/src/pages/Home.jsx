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
            const response = await api.get("/posts/feed");
            console.log("Fetched feed posts:", response.data?.posts);
            const feedPosts = response.data?.posts ?? response.data ?? [];
            setPosts(Array.isArray(feedPosts) ? feedPosts : []);
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