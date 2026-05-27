// src/components/post/PostList.tsx
import PostCard from "./PostCard";

export default function PostList({ posts }: { posts: any[] }) {
    if (!posts.length) {
        return <p className="text-gray-400 text-center">No hay posts aún</p>;
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}
