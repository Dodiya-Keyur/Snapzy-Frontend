import { useState } from "react";

function SearchPage() {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = (e) => {
        e.preventDefault();

        if (!search.trim()) return;

        // Replace this with your API call
        console.log({
            search,
            filter,
        });

        // Example result data
        setResults([
            {
                type: "user",
                id: 1,
                username: "john_doe",
                name: "John Doe",
                avatar: "https://i.pravatar.cc/150?img=12",
            },
            {
                type: "post",
                id: 2,
                username: "jane_doe",
                caption: "Beautiful day with amazing views 🌄",
                image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
            },
        ]);
    };

    const filteredResults =
        filter === "all"
            ? results
            : results.filter((item) => item.type === filter);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto w-full max-w-3xl">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Search
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Search for users and posts on Snapzy
                    </p>
                </div>

                {/* Filter */}
                <div className="mb-4 flex gap-2 rounded-xl bg-white p-2 shadow-sm border border-gray-100">

                    <button
                        onClick={() => setFilter("all")}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${filter === "all"
                            ? "bg-black text-white"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        All
                    </button>

                    <button
                        onClick={() => setFilter("user")}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${filter === "user"
                            ? "bg-black text-white"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        Users
                    </button>

                    <button
                        onClick={() => setFilter("post")}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${filter === "post"
                            ? "bg-black text-white"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        Posts
                    </button>

                </div>

                {/* Search Bar */}
                <form
                    onSubmit={handleSearch}
                    className="mb-8 flex items-center gap-2"
                >
                    <div className="relative flex-1">

                        <svg
                            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                            />
                        </svg>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={
                                filter === "user"
                                    ? "Search users..."
                                    : filter === "post"
                                        ? "Search posts..."
                                        : "Search users or posts..."
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                        />

                    </div>

                    <button
                        type="submit"
                        className="rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        Search
                    </button>
                </form>

                {/* Results */}
                {filteredResults.length > 0 ? (
                    <div className="space-y-4">

                        {filteredResults.map((result) => (
                            <div
                                key={`${result.type}-${result.id}`}
                                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                            >

                                {/* User Result */}
                                {result.type === "user" && (
                                    <div className="flex items-center gap-4">

                                        <img
                                            src={result.avatar}
                                            alt={result.username}
                                            className="h-14 w-14 rounded-full object-cover"
                                        />

                                        <div className="flex-1">
                                            <h2 className="font-semibold text-gray-900">
                                                {result.username}
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                {result.name}
                                            </p>
                                        </div>

                                        <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                                            View
                                        </button>

                                    </div>
                                )}

                                {/* Post Result */}
                                {result.type === "post" && (
                                    <div className="flex gap-4">

                                        <img
                                            src={result.image}
                                            alt="Post"
                                            className="h-24 w-24 rounded-xl object-cover"
                                        />

                                        <div className="flex-1">

                                            <p className="text-sm font-semibold text-gray-900">
                                                @{result.username}
                                            </p>

                                            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                                {result.caption}
                                            </p>

                                            <button className="mt-3 text-sm font-semibold text-black">
                                                View Post
                                            </button>

                                        </div>

                                    </div>
                                )}

                            </div>
                        ))}

                    </div>
                ) : (
                        <div className="rounded-2xl border border-gray-300 bg-gray-100 py-16 text-center">

                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                            <svg
                                className="h-6 w-6 text-black"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                                />
                            </svg>
                        </div>

                        <h2 className="font-semibold text-gray-900">
                            No results found
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Search for users or posts to see results.
                        </p>

                    </div>
                )}

            </div>
        </div>
    );
}

export default SearchPage;