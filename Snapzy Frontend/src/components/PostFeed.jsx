import PostCard from "./PostCard";

const posts = [
  {
    _id: "1",
    user: {
      username: "john_doe",
      fullname: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7",
    caption: "Beautiful day to explore something new.",
    location: "india",
    likes: 124,
    comments: 18,
    createdAt: "2 hours ago",
    liked: false,
    saved: false,
  },

  {
    _id: "2",
    user: {
      username: "jane_smith",
      fullname: "Jane Smith",
      avatar: "https://i.pravatar.cc/150?img=32",
    },
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    caption: "Life is better near the ocean 🌊",
    likes: 256,
    comments: 32,
    createdAt: "5 hours ago",
    liked: true,
    saved: false,
  },

  {
    _id: "3",
    user: {
      username: "alex_dev",
      fullname: "Alex Developer",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    caption: "Building something cool today.",
    likes: 89,
    comments: 12,
    createdAt: "1 day ago",
    liked: false,
    saved: true,
  },

  {
    _id: "4",
    user: {
      username: "travel_with_me",
      fullname: "Travel With Me",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    caption: "Another beautiful place added to the list.",
    likes: 342,
    comments: 45,
    createdAt: "2 days ago",
    liked: false,
    saved: false,
  },
];

const PostFeed = () => {
  return (
    <main className="w-full bg-neutral-50">
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </main>
  );
};

export default PostFeed;