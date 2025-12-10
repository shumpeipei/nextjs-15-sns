// components/PostList.tsx

import { auth } from "@clerk/nextjs/server";
import { fetchposts } from "@/lib/postDataFetcher";
import Post from "./post";


export default async function PostList({ username }: { username?: string }) {

  const { userId } = auth();
  if (!userId) {
    return;
  }
  const posts = await fetchposts(userId, username);

  return (
    <div className="space-y-4">
      {posts ? (
        posts.map((post) => <Post key={post.id} post={post} />)
      ) : (
        <div>ポストが見つかりませんよ。</div>
      )}
    </div>
  );
}
