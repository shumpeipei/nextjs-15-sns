// Client Componentとして動作させ、ユーザー操作に即時反応できるようにする。
"use client";
import React, { FormEvent, useEffect, useOptimistic, useState } from "react";
// 共通UI（ボタン）とアイコン群
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, Share2Icon, EditIcon } from "./Icons";
// Clerkのクライアント側認証フック
import { useAuth } from "@clerk/nextjs";
// サーバーアクション（いいね/投稿更新）
import { liveAction, updatePostAction } from "@/lib/action";


// いいねの表示用状態（楽観的UIで扱う最小構成）
interface likeState {
    likeCount: number,
    isLiked: boolean,
}
type PostInterctionProps = {
    postId: string;
    initialLikes: string[];
    commentNumber: number;
    initialContent: string;
    isOwnPost: boolean;
};

// いいね/コメント/共有/編集などの投稿アクション群をまとめたUI。
const PostInterction = ({ postId, initialLikes, commentNumber, initialContent, isOwnPost }: PostInterctionProps) => {

    // 現在ログイン中のユーザーID（未ログインならnull/undefined）
    const { userId } = useAuth();

    // 初期表示用のいいね状態
    const initialState = {
        likeCount: initialLikes.length,
        isLiked: userId ? initialLikes.includes(userId) : false
    }
    // useOptimistic で「即時反映」→「サーバー結果待ち」の体験を作る
    const [optimisticLike, addOptimisticLike] = useOptimistic<likeState, void>(initialState, (currentState) => ({
        // 楽観的更新：いいね数と状態をトグル
        likeCount: currentState.likeCount
            ? currentState.likeCount - 1
            : currentState.likeCount + 1,
        isLiked: !currentState.isLiked,
    }));

    // 投稿編集UIの開閉と内容管理
    const [isEditing, setIsEditing] = useState(false);
    const [editingContent, setEditingContent] = useState(initialContent);
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        // SSR時はwindowがないため早期リターン
        if (typeof window === "undefined") {
            return;
        }
        // 他の投稿で編集が開いたら、現在の編集を閉じる
        const closeOtherEditors = (event: Event) => {
            const custom = event as CustomEvent<{ postId: string }>;
            if (custom.detail?.postId !== postId) {
                setIsEditing(false);
            }
        };
        window.addEventListener("post-edit-open", closeOtherEditors as EventListener);
        return () => {
            window.removeEventListener("post-edit-open", closeOtherEditors as EventListener);
        };
    }, [postId]);

    // 編集モードを開く（他の編集画面を閉じるイベントも発火）
    const handleOpenEditor = () => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("post-edit-open", { detail: { postId } }));
        }
        setEditingContent(initialContent);
        setValidationError("");
        setIsEditing(true);
    };

    // 編集をキャンセルして元の内容に戻す
    const handleCancelEdit = () => {
        setEditingContent(initialContent);
        setValidationError("");
        setIsEditing(false);
    };

    // 投稿内容を更新（入力バリデーション → サーバーアクション）
    const handleUpdate = async () => {
        if (!editingContent.trim()) {
            setValidationError("1文字以上入力してください");
            return;
        }

        try {
            setValidationError("");
            await updatePostAction(postId, editingContent);
            setIsEditing(false);
        } catch (err) {
            if (err instanceof Error) {
                setValidationError(err.message);
            } else {
                setValidationError("更新に失敗しました");
            }
        }
    };

    // いいねの送信（楽観的更新→サーバーアクション）
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
            {/* いいねボタン（サーバーアクション） */}
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
            {/* いいね数 */}
            <span className={`-ml-1 ${optimisticLike.isLiked ? "text-destructive" : ""}`} >{optimisticLike.likeCount}</span>
            {/* コメント数（UIのみ） */}
            <Button variant="ghost" size="icon">
                <MessageCircleIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            <span>{commentNumber}</span>
            {/* 共有（UIのみ） */}
            <Button variant="ghost" size="icon">
                <Share2Icon className="h-5 w-5 text-muted-foreground" />
            </Button>
            {isOwnPost && (
                <>
                    {/* 自分の投稿だけ編集ボタンを表示 */}
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={handleOpenEditor}
                    >
                        <EditIcon className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    {isEditing && (
                        // 編集フォーム（ポップオーバー）
                        <div className="absolute left-0 top-full z-10 mt-3 w-80 rounded-lg border bg-background p-4 shadow-lg">
                            <p className="mb-2 text-sm font-semibold text-muted-foreground">投稿内容を編集</p>
                            <textarea
                                className="h-32 w-full resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                value={editingContent}
                                onChange={(event) => {
                                    setEditingContent(event.target.value);
                                    if (validationError && event.target.value.trim().length) {
                                        setValidationError("");
                                    }
                                }}
                            />
                            {validationError && (
                                <p className="mt-1 text-sm text-destructive">{validationError}</p>
                            )}
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
                </>
            )}
        </div>
    );
};


export default PostInterction;
