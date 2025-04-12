'use client';

import { LiveblocksProvider } from '@liveblocks/react';
import { PropsWithChildren } from 'react';

export function Providers({ children }: PropsWithChildren) {
    return (
        <LiveblocksProvider
            authEndpoint="/api/liveblocks-auth"
            resolveUsers={async ({ userIds }) => {
                return userIds.map((userId) => ({
                    name: `${userId}`,
                    picture: `https://api.adorable.io/avatars/285/${userId}.png`,
                }));
            }}
            resolveMentionSuggestions={async ({ text, roomId }) => {
                // The text the user is searching for, e.g. "mar"

                console.log(text);
                // Return a list of user IDs that match the query
                const matchingUsers = ['aaryathakur48@gmail.com', 'yusufmustufa@gmail.com', 'kishanwali16@gmail.com'];

                return matchingUsers.filter((user) => user.includes(text));
            }}
        >
            {children}
        </LiveblocksProvider>
    );
}
