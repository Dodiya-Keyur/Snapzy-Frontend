const Bone = ({ className = "" }) => (
    <div className={`bg-gray-200 rounded ${className}`} />
);

function PostSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
                <Bone className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Bone className="h-3 w-24" />
                    <Bone className="h-3 w-16" />
                </div>
                <Bone className="h-9 w-20 rounded-full" />
            </div>
            <Bone className="h-72 rounded-xl" />
            <Bone className="h-3 w-3/4 mt-4" />
        </div>
    );
}

function SuggestedSkeleton() {
    return (
        <div className="flex items-center gap-3">
            <Bone className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Bone className="h-3 w-24" />
                <Bone className="h-3 w-32" />
            </div>
            <Bone className="h-8 w-16 rounded-full" />
        </div>
    );
}

export default function SkeletonPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center gap-8 p-6 animate-pulse">
            {/* Feed */}
            <div className="w-full max-w-xl space-y-6">
                <PostSkeleton />
                <PostSkeleton />
            </div>

            {/* Right sidebar (hidden on mobile) */}
            <aside className="hidden lg:block w-80 space-y-5">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
                    <Bone className="h-4 w-32" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <SuggestedSkeleton key={i} />
                    ))}
                </div>
            </aside>
        </div>
    );
}