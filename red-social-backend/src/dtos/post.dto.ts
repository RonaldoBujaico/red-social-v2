export type CreatePostDto = {
  content: string;
  visibility?: "public" | "friends" | "private";
  imageUrl?: string | null;
};

export type UpdatePostDto = {
  content?: string;
  visibility?: "public" | "friends" | "private";
};