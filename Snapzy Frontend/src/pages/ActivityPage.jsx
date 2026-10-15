import { useMemo, useState } from "react";

const activities = [
  {
    id: 1,
    type: "like",
    date: "Today",
    username: "john_doe",
    avatar: "https://i.pravatar.cc/150?img=12",
    postImage: "https://picsum.photos/200/200?random=10",
    caption: "Beautiful day to explore something new.",
    time: "1 hour ago",
  },
  {
    id: 2,
    type: "comment",
    date: "Today",
    username: "aarav.codes",
    avatar: "https://i.pravatar.cc/150?img=32",
    postImage: "https://picsum.photos/200/200?random=11",
    caption: "This setup is insane, what monitor is that?",
    time: "2 hours ago",
  },
  {
    id: 3,
    type: "save",
    date: "Today",
    username: "travel_world",
    avatar: "https://i.pravatar.cc/150?img=45",
    postImage: "https://picsum.photos/200/200?random=12",
    caption: "Hidden places you need to visit.",
    time: "4 hours ago",
  },
  {
    id: 4,
    type: "like",
    date: "Today",
    username: "alex_miller",
    avatar: "https://i.pravatar.cc/150?img=15",
    postImage: "https://picsum.photos/200/200?random=13",
    caption: "A peaceful evening.",
    time: "5 hours ago",
  },
  {
    id: 5,
    type: "comment",
    date: "Yesterday",
    username: "emma_jones",
    avatar: "https://i.pravatar.cc/150?img=25",
    postImage: "https://picsum.photos/200/200?random=14",
    caption: "This place looks incredible!",
    time: "Yesterday",
  },
  {
    id: 6,
    type: "save",
    date: "Yesterday",
    username: "design_daily",
    avatar: "https://i.pravatar.cc/150?img=20",
    postImage: "https://picsum.photos/200/200?random=15",
    caption: "Modern UI inspiration.",
    time: "Yesterday",
  },
];

function ActivityIcon({ type }) {
  if (type === "like") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
          />
        </svg>
      </div>
    );
  }

  if (type === "comment") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-500">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
          />
        </svg>
      </div>
    );
  }

  if (type === "save") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-500">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
          />
        </svg>
      </div>
    );
  }

  return null;
}

function StatCard({ type, count, label }) {
  const styles = {
    like: "bg-rose-50 text-rose-500",
    save: "bg-amber-50 text-amber-500",
    comment: "bg-blue-50 text-blue-500",
    follow: "bg-emerald-50 text-emerald-500",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles[type]}`}
      >
        {type === "like" && (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
            />
          </svg>
        )}

        {type === "save" && (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
            />
          </svg>
        )}

        {type === "comment" && (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
            />
          </svg>
        )}

        {type === "follow" && (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
            />
            <circle cx="9" cy="7" r="4" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 8v6M22 11h-6"
            />
          </svg>
        )}
      </div>

      <div>
        <p className="text-2xl font-semibold text-gray-900">
          {count}
        </p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const filteredActivities = useMemo(() => {
    let result =
      activeFilter === "all"
        ? [...activities]
        : activities.filter(
          (activity) => activity.type === activeFilter
        );

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (activity) =>
          activity.username.toLowerCase().includes(query) ||
          activity.caption.toLowerCase().includes(query)
      );
    }

    if (sort === "oldest") {
      result.reverse();
    }

    return result;
  }, [activeFilter, search, sort]);

  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    if (!groups[activity.date]) {
      groups[activity.date] = [];
    }

    groups[activity.date].push(activity);

    return groups;
  }, {});

  const filters = [
    { id: "all", label: "All activity" },
    { id: "like", label: "Likes" },
    { id: "comment", label: "Comments" },
    { id: "save", label: "Saved" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 lg:px-8 mt-[-30px] md:mt-1">
      <div className="mx-auto w-full max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Your activity
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Everything you've liked, saved and commented on, in one
            place.
          </p>
        </div>

        {/* Statistics */}
        {/* <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            type="like"
            count="3"
            label="Likes"
          />

          <StatCard
            type="save"
            count="2"
            label="Saved"
          />

          <StatCard
            type="comment"
            count="3"
            label="Comments"
          />

          <StatCard
            type="follow"
            count="1"
            label="Follows"
          />
        </div> */}

        {/* Search + Sort */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row">

          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path
                strokeLinecap="round"
                d="m20 20-4-4"
              />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, caption or comment"
              className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </div>

          {/* Sort */}
          <div className="relative lg:w-48">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-14 w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>

            <svg
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 9 6 6 6-6"
              />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium transition ${activeFilter === filter.id
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Activity Feed */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {Object.keys(groupedActivities).length > 0 ? (
            Object.entries(groupedActivities).map(
              ([date, items]) => (
                <div key={date}>

                  {/* Date */}
                  <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
                    <h2 className="text-sm font-semibold text-gray-500">
                      {date}
                    </h2>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-100">
                    {items.map((activity) => (
                      <div
                        key={activity.id}
                        className="group flex items-center gap-4 px-5 py-5 transition hover:bg-gray-50 sm:px-7"
                      >
                        {/* Post image */}
                        <div className="relative shrink-0">
                          <img
                            src={
                              activity.postImage
                            }
                            alt=""
                            className="h-16 w-16 rounded-xl object-cover sm:h-20 sm:w-20"
                          />

                          <div className="absolute -bottom-2 -right-2">
                            <ActivityIcon
                              type={
                                activity.type
                              }
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-700 sm:text-base">
                            You{" "}
                            {activity.type ===
                              "like" &&
                              "liked a post by "}
                            {activity.type ===
                              "comment" &&
                              "commented on a post by "}
                            {activity.type ===
                              "save" &&
                              "saved a post by "}

                            <span className="font-semibold text-gray-900">
                              {
                                activity.username
                              }
                            </span>
                          </p>

                          {activity.type ===
                            "comment" ? (
                            <div className="mt-2 max-w-2xl rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                              “
                              {
                                activity.caption
                              }
                              ”
                            </div>
                          ) : (
                            <p className="mt-1 truncate text-sm text-gray-500">
                              {
                                activity.caption
                              }
                            </p>
                          )}

                          <p className="mt-2 text-xs text-gray-400">
                            {activity.time}
                          </p>
                        </div>

                        {/* Arrow */}
                        <button className="hidden shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 sm:block">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m9 5 7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )
          ) : (
            /* Empty State */
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-7 w-7 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                No activity found
              </h3>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Try changing your filter or search for
                something else.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;