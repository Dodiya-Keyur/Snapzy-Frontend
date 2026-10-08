import { useState } from "react";

const suggestions = [
  { id: 1, username: "aarav.codes", reason: "Followed by mira + 3 more", img: 11 },
  { id: 2, username: "pixel_priya", reason: "New to Snapzy", img: 12 },
  { id: 3, username: "dev.rohan", reason: "Followed by aarav.codes", img: 13 },
  { id: 4, username: "travel.with.neha", reason: "Suggested for you", img: 14 },
  { id: 5, username: "lens_by_karan", reason: "Followed by pixel_priya", img: 15 },
];

const footerLinks = ["About", "Help", "Press", "API", "Privacy", "Terms"];

function Avatar({ src, size = "h-10 w-10", ring = false }) {
  if (!ring) {
    return (
      <img
        src={src}
        alt="avatar"
        className={`${size} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className="rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
      <div className="rounded-full bg-white p-[2px]">
        <img
          src={src}
          alt="avatar"
          className={`${size} rounded-full object-cover`}
        />
      </div>
    </div>
  );
}

function RightSidebar() {
  const [following, setFollowing] = useState({});

  const toggleFollow = (id) =>
    setFollowing((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside className="sticky top-6 w-80">

      {/* Current User */}
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm ring-1 ring-gray-200/70">

        <div className="flex items-center gap-3">
          <Avatar
            ring
            size="h-12 w-12"
            src="https://i.pravatar.cc/150?img=1"
          />

          <div className="leading-tight">
            <p className="flex items-center gap-1 text-sm font-semibold text-gray-900">
              keyur
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-blue-500"
                fill="currentColor"
              >
                <path d="M12 2l2.4 1.7 2.9-.1 1 2.7 2.4 1.7-.9 2.8.9 2.8-2.4 1.7-1 2.7-2.9-.1L12 22l-2.4-1.7-2.9.1-1-2.7-2.4-1.7.9-2.8-.9-2.8 2.4-1.7 1-2.7 2.9.1L12 2zm-1.2 13.4l5-5-1.4-1.4-3.6 3.6-1.6-1.6-1.4 1.4 3 3z" />
              </svg>
            </p>
            <p className="text-xs text-gray-500">Keyur Dodiya</p>
          </div>
        </div>

        <button className="rounded-full px-3 py-1 text-xs font-semibold text-blue-500 transition hover:bg-blue-50 hover:text-blue-600">
          Switch
        </button>
      </div>

      {/* Suggestions */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/70">

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-500">
            Suggested for you
          </p>

          <button className="text-xs font-semibold text-gray-900 transition hover:text-blue-500">
            See All
          </button>
        </div>

        <div className="space-y-1">
          {suggestions.map((user) => {
            const isFollowing = !!following[user.id];

            return (
              <div
                key={user.id}
                className="group flex items-center justify-between rounded-xl p-2 transition hover:bg-gray-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="transition-transform duration-200 group-hover:scale-105">
                    <Avatar
                      ring
                      src={`https://i.pravatar.cc/150?img=${user.img}`}
                    />
                  </div>

                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold text-gray-900 group-hover:underline">
                      {user.username}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {user.reason}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`ml-2 shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition active:scale-95 ${isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-blue-500 text-white shadow-sm hover:bg-blue-600"
                    }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 px-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400">
          {footerLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="transition hover:text-gray-600 hover:underline"
            >
              {link}
            </a>
          ))}
        </div>

        <p className="mt-3 text-xs uppercase tracking-wide text-gray-300">
          © 2026 Snapzy
        </p>
      </div>

    </aside>
  );
}

export default RightSidebar;