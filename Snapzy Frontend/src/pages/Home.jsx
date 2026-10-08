import RightSidebar from "../components/RightSidebar";
import PostFeed from "../components/PostFeed";

function Home() {
    return (
        <div className="min-h-screen bg-gray-50 mt-[-15px] md:mt-1">
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