import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HeartIcon, MessageCircleIcon, Share2Icon, ClockIcon, EditIcon } from "./Icons";
import prisma from "@/lib/prisma";
import PostInterction from "./postInterction";
import Link from "next/link";

// 1件の投稿カードを表示するコンポーネント。
const Post = ({ post, currentUserId }: { post: any; currentUserId: string }) => {
  return (
    <div
      key={post.id}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
    >
      <div className="flex items-center gap-4 mb-4">
        <Link href={`/profile/${post.author.username}`}>
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.image} />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h3 className="text-lg font-bold">{post.author.name}</h3>
          <p className="text-muted-foreground">{post.author.username}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p>{post.content}</p>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <PostInterction
            postId={post.id}
            initialLikes={post.likes.map((like: any) => like.userId)}
            commentNumber={post._count.replies}
            initialContent={post.content}
            isOwnPost={post.authorId === currentUserId}
          />
        </div >
        <div className="flex items-center gap-2 text-muted-foreground">
          <ClockIcon className="h-5 w-5" />
          <div className="flex items-center gap-1.5">
            {post.createdAt.getTime() !== post.updatedAt.getTime() && (
              <span className="text-xs">編集済み</span>
            )}
            <span>{post.createdAt.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Post;
