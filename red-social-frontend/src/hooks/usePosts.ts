import { useEffect, useState } from "react";
import { getAllPostsRequest, createPostRequest } from "@/api/post.api";

export const usePosts = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await getAllPostsRequest();
            setPosts(data);
        } catch (err) {
            console.error("Error fetching posts", err);
        } finally {
            setLoading(false);
        }
    };

    const createPost = async (content: string, image?: File | null) => {
        try {
            await createPostRequest({ content, image });

            await fetchPosts();
        } catch (err) {
            console.error("Error creating post", err);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return {
        posts,
        loading,
        createPost,
        fetchPosts,
    };
};
