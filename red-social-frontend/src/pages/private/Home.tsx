import CreatePost from "@/components/post/CreatePost";
import PostList from "@/components/post/PostList";
import { usePosts } from "@/hooks/usePosts";

export default function Home() {
    const { posts, createPost, loading } = usePosts();

    return (
        <div className="max-w-2xl md:max-w-3xl w-full mx-auto space-y-6">

            <CreatePost onCreate={createPost} />

            {loading ? (
                <p className="text-center text-gray-500">Cargando...</p>
            ) : (
                <PostList posts={posts} />
            )}
        </div>
    );
}