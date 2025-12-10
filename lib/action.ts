"use server";
import { auth } from "@clerk/nextjs/server";
import prisma from "./prisma";
import { z } from "zod";
import { error } from "console";
import { resolve } from "path";
import { revalidatePath } from "next/cache";

type state = {
    error?: string | undefined;
    success: boolean;
};

export async function addPostAction(prevState: state, formData: FormData): Promise<state> {
    try {


        const { userId } = auth();
        if (!userId) {
            return {
                error: "ユーザが存在しません。",
                success: false,
            };;
        }
        const postText = formData.get("post") as string;
        const postTextSchema = z
            .string()
            .min(1, "ポスト内容を入力してください。")
            .max(140, "140文字以内で入力してください。");
        const validatedPostTest = postTextSchema.parse(postText);

        await new Promise((resolve) => setTimeout(resolve, 3000));

        await prisma.post.create({
            data: {
                content: postText,
                authorId: userId,
            },
        });

        revalidatePath("/");

        return {
            error: undefined,
            success: true,
        };

    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                error: error.errors.map((e) => e.message).join(","),
                success: false,
            };
        } else if (error instanceof Error) {
            return {
                error: error.message,
                success: false,
            };
        } else {
            return {
                error: "予期せぬエラーが発生しました。",
                success: false,
            };
        }
    }
}

export const liveAction = async (postId: string) => {

    const { userId } = auth();
    if (!userId) {
        return;
    }
    try {
        const exitinglike = await prisma.like.findFirst({
            where: {
                postId,
                userId,
            },
        });
        console.log(exitinglike);
        if (exitinglike) {
            await prisma.like.delete({
                where: {
                    id: exitinglike.id,
                },
            });

        } else {
            await prisma.like.create({
                data: {
                    postId,
                    userId,
                },
            });
        }
        revalidatePath("/");
    } catch (err) {
        console.log(err);
    }
}

export const followAction = async (userId: string) => {
    const { userId: currentUserId } = auth();
    if (!currentUserId) {
        return;
    }
    try {
        // unfollow
        const exitingFollow = await prisma.follow.findFirst({
            where: {
                followerId: currentUserId,
                followingId: userId,
            },
        });
        if (exitingFollow) {
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: userId,
                    }
                },
            });
        } else {
            //follow
            await prisma.follow.create({
                data: {
                    followerId: currentUserId,
                    followingId: userId,
                },
            });
        }
        revalidatePath(`profile/${userId}`);

    } catch (err) {
        console.log(err);
    }
};