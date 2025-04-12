import { Liveblocks } from '@liveblocks/node';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';

/**
 * Authenticating your Liveblocks application
 * https://liveblocks.io/docs/authentication
 */

const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return new Response('Unauthorized', { status: 401 });
    }

    const userInfo = {
        name: session.user.name || 'Anonymous',
        picture: session.user.image || `https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 8) + 1}.png`,
        color: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
    };

    // Use email as the unique identifier
    const liveblocksSession = liveblocks.prepareSession(session.user.email, {
        userInfo,
    });

    // Allow access to all rooms
    liveblocksSession.allow(`*`, liveblocksSession.FULL_ACCESS);

    // Authorize the user and return the result
    const { body, status } = await liveblocksSession.authorize();
    return new Response(body, { status });
}

const USER_COLORS = ['#D583F0', '#F08385', '#F0D885', '#85EED6', '#85BBF0', '#8594F0', '#85DBF0', '#87EE85'];
