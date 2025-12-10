import { use } from "react";
import prisma from "./prisma";

export async function fetchposts(userId: string, username?: string) {
    if (username) {
        return await prisma.post.findMany({
            where: {
                author: {
                    username: username,
                },
            },
            include: {
                author: true,
                likes: {
                    select: {
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    if (!username && userId) {
        const following = await prisma.follow.findMany({
            where: {
                followerId: userId,
            },
            select: {
                followingId: true,
            },
        });

        const followingIds = following.map((f) => f.followingId);
        const ids = [userId, ...followingIds];

        //SSR
        return await prisma.post.findMany({
            where: {
                authorId: {
                    in: ids,
                },
            },
            include: {
                author: true,
                likes: {
                    select: {
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            }
        });
    }
}