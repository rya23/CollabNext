'use client';

import { ReactNode } from 'react';

import { ClientSideSuspense, RoomProvider } from '@liveblocks/react';

interface RoomProps {
    children: ReactNode;
    roomId: string;
}

export function Room({ children, roomId }: RoomProps) {
    return (
        <RoomProvider
            id={roomId}
            initialPresence={{
                cursor: null,
                selection: [],
                isTyping: false,
            }}
            initialStorage={{
                content: '',
            }}
        >
            <ClientSideSuspense
                fallback={
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                    </div>
                }
            >
                {() => children}
            </ClientSideSuspense>
        </RoomProvider>
    );
}
