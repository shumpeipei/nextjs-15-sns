"use client";
import React, { useOptimistic } from "react";
import { Button } from "../ui/button";
import { followAction } from "@/lib/action";
import { currentUser } from "@clerk/nextjs/server";

interface FollowButtonProps {
    isCurrentUser: boolean,
    userId: string
    isFollowing: boolean,
}

const FollowButton = ({ isCurrentUser, userId, isFollowing }: FollowButtonProps) => {

    const [optimisticFollow, addOptimisticFollow] = useOptimistic<
        {
            isFollowing: boolean;
        },
        void
    >(
        {
            isFollowing
        },
        (currentState) => ({
            isFollowing: !currentState.isFollowing
        })
    )

    const getButtonContet = () => {
        if (isCurrentUser) {
            return "プロフィール編集";
        }
        if (optimisticFollow.isFollowing) {
            return "フォロー中";
        }
        return "フォローする";
    }

    const getButtonVariant = () => {
        if (isCurrentUser) {
            return "secondary";
        }
        if (optimisticFollow.isFollowing) {
            return "outline";
        }
        return "default";
    }

    const handleFollowAction = async () => {
        if (isCurrentUser) {
            return;
        }
        try {
            addOptimisticFollow();
            await followAction(userId);

        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <form action={handleFollowAction}>
                <Button
                    variant={getButtonVariant()}
                    className="w-full"
                >
                    {getButtonContet()}
                </Button>
            </form>
        </div>
    )
}

export default FollowButton;