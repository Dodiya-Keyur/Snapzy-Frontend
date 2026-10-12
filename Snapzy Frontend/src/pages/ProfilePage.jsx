import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const username = user?.username || "Keyur";
    const fullName = user?.name || "Keyur Patel";
    const avatar =
        user?.profilePicture ||
        user?.avatar ||
        user?.profilePic ||
        "https://i.pravatar.cc/300?img=12";
    const bio =
        user?.bio ||
        "Computer Science Engineering Student\nBuilding projects and learning new technologies.\n🚀 Code • Learn • Build";

    const posts = [
        { _id: 1, image: "https://picsum.photos/500?random=1" },
        { _id: 2, image: "https://picsum.photos/500?random=2" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 mt-[-30px] md:mt-0">
            <div className="mx-auto max-w-4xl">

                {/* Profile Header */}
                <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-8">
                    <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4 sm:items-start sm:gap-x-8">

                        {/* Profile Picture: left on all sizes */}
                        <div className="sm:row-span-4 sm:row-start-1">
                            <img
                                src={avatar}
                                alt={username}
                                className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-100 sm:h-32 sm:w-32 md:h-36 md:w-36"
                            />
                        </div>

                        {/* Username + Name: right of picture */}
                        <div className="sm:col-start-2 sm:row-start-1">
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                {username}
                            </h1>
                            <h2 className="mt-1 text-sm font-semibold text-gray-700 sm:text-base">
                                {fullName}
                            </h2>
                        </div>

                        {/* Stats */}
                        <div className="col-span-2 flex justify-around sm:col-span-1 sm:col-start-2 sm:row-start-2 sm:justify-start sm:gap-8">
                            <div className="text-center sm:text-left">
                                <p className="text-lg font-bold text-gray-900">24</p>
                                <p className="text-sm text-gray-500">Posts</p>
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="text-lg font-bold text-gray-900">1.2K</p>
                                <p className="text-sm text-gray-500">Followers</p>
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="text-lg font-bold text-gray-900">356</p>
                                <p className="text-sm text-gray-500">Following</p>
                            </div>
                        </div>

                        {/* Bio: below on mobile, right column on desktop */}
                        <p className="col-span-2 max-w-lg whitespace-pre-line text-sm leading-6 text-gray-600 sm:col-span-1 sm:col-start-2 sm:row-start-3">
                            {bio}
                        </p>

                        {/* Edit Button: last */}
                        <div className="col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-4">
                            <button
                                onClick={() => navigate("/edit-profile")}
                                className="w-full rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-95 sm:w-auto"
                            >
                                Edit Profile
                            </button>
                        </div>

                    </div>
                </div>

                {/* Posts Section */}
                <div className="mt-8">

                    <div className="mb-5 border-b border-gray-200">
                        <button className="border-b-2 border-black px-6 pb-3 text-sm font-semibold text-gray-900">
                            Posts
                        </button>
                    </div>

                    {posts.length > 0 ? (
                        /* Post Grid */
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {posts.map((post) => (
                                <div
                                    key={post._id || post.id}
                                    className="aspect-square overflow-hidden rounded-lg bg-gray-200"
                                >
                                    <img
                                        src={post.image}
                                        alt="Post"
                                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-900">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-gray-900"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 9a2 2 0 012-2h1.5l1-2h9l1 2H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                    />
                                    <circle cx="12" cy="13" r="3.5" />
                                </svg>
                            </div>

                            <h2 className="mb-2 text-3xl font-extrabold text-gray-900">
                                Share Photos
                            </h2>
                            <p className="mb-4 text-sm text-gray-600">
                                When you share photos, they will appear on your profile.
                            </p>

                            <button
                                onClick={() => navigate("/create-post")}
                                className="text-sm font-semibold text-blue-500 hover:text-blue-600"
                            >
                                Share your first photo
                            </button>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

export default ProfilePage;