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
};

const PostInterction = ({ postId, initialLikes, commentNumber }: PostInterctionProps) => {

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

    const hundleLikeSubmit = async () => {

        try {
            addOptimisticLike();
            await liveAction(postId);
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="flex items-center">
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
            <Button variant="ghost" size="icon">
                <EditIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
        </div>
    );
};


export default PostInterction;