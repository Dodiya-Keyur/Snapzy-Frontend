import RightSidebar from "../components/RightSidebar";
import PostFeed from "../components/PostFeed";
import { useEffect, useState } from "react";
import SkeletonLoader from "../components/SkeletonLoader";

function Home() {

    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     async function fetchPosts() {
    //         try {
    //             const response = await getAllPosts();
    //             setPosts(response.data.posts);
    //         } catch (error) {
    //             console.error("Failed to fetch posts:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     fetchPosts();
    // }, []);

    // if (loading) {
    //     return <SkeletonLoader />;
    // }


    return (
        <div className="min-h-screen bg-gray-50 mt-[-30px] md:mt-1">
            <main className="">
                <div className="mx-auto flex max-w-[1200px] items-start justify-center gap-20 px-4 py-6 sm:px-6 lg:px-8">

                    {/* Post Feed */}
                    <section className="w-full max-w-[650px]">
                        <PostFeed />
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