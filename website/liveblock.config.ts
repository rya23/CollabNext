// Define Liveblocks types for your application

import { LiveList, createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
    interface Liveblocks {
        // Each user's Presence, for useMyPresence, useOthers, etc.
        Presence: {
            // Example, real-time cursor coordinates
            cursor: { x: number; y: number } | null;
            selection: string[];
            isTyping: boolean;
        };

        // The Storage tree for the room, for useMutation, useStorage, etc.
        Storage: {
            // Example, a conflict-free list
            // animals: LiveList<string>;
            content: string;
        };

        // Custom user info set when authenticating with a secret key
        UserMeta: {
            id: string; // Accessible through `user.id`
            info: {
                name: string;
                color: string;
                avatar: string;
            }; // Accessible through `user.info`
        };

        // Custom events, for useBroadcastEvent, useEventListener
        RoomEvent: {};
        // Example has two events, using a union
        // | { type: "PLAY" }
        // | { type: "REACTION"; emoji: "🔥" };

        // Custom metadata set on threads, for useThreads, useCreateThread, etc.
        ThreadMetadata: {
            // Example, attaching coordinates to a thread
            // x: number;
            // y: number;
        };

        // Custom room info set with resolveRoomsInfo, for useRoomInfo
        RoomInfo: {
            // Example, rooms with a title and url
            // title: string;
            // url: string;
        };
    }
}

// Extract presence and storage types from the Liveblocks interface
type Presence = Liveblocks['Presence'];
type Storage = Liveblocks['Storage'];

// Create the Liveblocks client
const client = createClient({
    publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || '',
    // Uncomment the following line for authentication with your backend
    // authEndpoint: "/api/liveblocks-auth",
});

export const { RoomProvider, useOthers, useStorage, useMutation, useUpdateMyPresence, useMyPresence, useSelf, useRoom } =
    createRoomContext<Presence, Storage>(client);
