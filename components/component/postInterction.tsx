"use client";
import React, { FormEvent, useOptimistic, useState } from "react";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, Share2Icon, EditIcon } from "./Icons";
import { useAuth } from "@clerk/nextjs";
import { liveAction } from "@/lib/action";


interface likeState {
    likeCount: number,
    isLiked: boolean,
}
type PostInterctionProps = {
    postId: string;
    initialLikes: string[];
    commentNumber: number;
    initialContent: string;
};

const PostInterction = ({ postId, initialLikes, commentNumber, initialContent }: PostInterctionProps) => {

    const { userId } = useAuth();

    const initialState = {
        likeCount: initialLikes.length,
        isLiked: userId ? initialLikes.includes(userId) : false
    }
    const [optimisticLike, addOptimisticLike] = useOptimistic<likeState, void>(initialState, (currentState) => ({
        // update function
        likeCount: currentState.likeCount
            ? currentState.likeCount - 1
            : currentState.likeCount + 1,
        isLiked: !currentState.isLiked,
    }));

    const [isEditing, setIsEditing] = useState(false);
    const [editingContent, setEditingContent] = useState(initialContent);

    const handleOpenEditor = () => {
        setEditingContent(initialContent);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setEditingContent(initialContent);
        setIsEditing(false);
    };

    const handleUpdate = () => {
        // バックエンド未実装のため局所的に閉じるだけ
        setIsEditing(false);
    };

    const hundleLikeSubmit = async () => {

        try {
            addOptimisticLike();
            await liveAction(postId);
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="relative flex items-center gap-1">
            <form action={hundleLikeSubmit}>
                <Button variant="ghost" size="icon">
                    <HeartIcon
                        className={`h-5 w-5
                            ${optimisticLike.isLiked
                                ? "text-destructive"
                                : "text-muted-foregrund"
                            }`}
                    />
                </Button>
            </form>
            <span className={`-ml-1 ${optimisticLike.isLiked ? "text-destructive" : ""}`} >{optimisticLike.likeCount}</span>
            <Button variant="ghost" size="icon">
                <MessageCircleIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            <span>{commentNumber}</span>
            <Button variant="ghost" size="icon">
                <Share2Icon className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleOpenEditor}
            >
                <EditIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            {isEditing && (
                <div className="absolute left-0 top-full z-10 mt-3 w-80 rounded-lg border bg-background p-4 shadow-lg">
                    <p className="mb-2 text-sm font-semibold text-muted-foreground">投稿内容を編集</p>
                    <textarea
                        className="h-32 w-full resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={editingContent}
                        onChange={(event) => setEditingContent(event.target.value)}
                    />
                    <div className="mt-3 flex justify-end gap-2">
                        <Button variant="outline" size="sm" type="button" onClick={handleCancelEdit}>
                            キャンセル
                        </Button>
                        <Button size="sm" type="button" onClick={handleUpdate}>
                            更新
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default PostInterction;