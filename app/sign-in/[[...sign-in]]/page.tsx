import { SignIn } from '@clerk/nextjs'

// サインイン画面（ClerkのUI）を中央に配置。
export default function Page() {
    return (
        <div className='h-[calc(100vh-96px)] flex items-center justify-center'>
            <SignIn />
        </div>
    )
}
