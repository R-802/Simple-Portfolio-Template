import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest and NextResponse from next/server
import { adminDb, adminAuth } from 'firebaseAdmin';

export async function POST(request: NextRequest) { // Use NextRequest type
    const authHeader = request.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return NextResponse.json({ error: 'Authorization token missing' }, { status: 401 });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const user = decodedToken; // Extract user details from token
        const { postSlug, content, author, parentId } = await request.json();

        if (!postSlug || !content || !author) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Ensure the user is authenticated (we trust the token)
        const commentData = {
            postSlug,
            content,
            author,  // This is the display name, not the uid
            parentId: parentId || null,
            createdAt: new Date().toISOString(),
            uid: user.uid,  // Store uid separately for authorization
            upvotes: 0,  // Initialize upvotes
            downvotes: 0,  // Initialize downvotes
            replies: [],  // Initialize replies
            mentionedUsers: []  // Initialize mentioned users if applicable
        };

        await adminDb.collection('comments').add(commentData);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error verifying token:', error);
        return NextResponse.json({ error: 'Failed to verify token' }, { status: 403 });
    }
}

export async function GET(request: NextRequest) { // Use NextRequest type
    try {
        const { searchParams } = new URL(request.url); // Access the URL from NextRequest
        const postSlug = searchParams.get('postSlug');

        if (!postSlug) {
            return NextResponse.json({ error: 'Post slug is required' }, { status: 400 });
        }

        const q = adminDb.collection('comments').where('postSlug', '==', postSlug);
        const querySnapshot = await q.get();

        const commentsMap = new Map();
        const topLevelComments = [];

        // First pass: create all comment objects
        querySnapshot.forEach(docSnapshot => {
            const comment = { id: docSnapshot.id, ...docSnapshot.data(), replies: [] };
            commentsMap.set(comment.id, comment);
        });

        // Second pass: structure comments hierarchically
        for (const comment of commentsMap.values()) {
            if (comment.parentId) {
                const parentComment = commentsMap.get(comment.parentId);
                if (parentComment) {
                    parentComment.replies.push(comment);
                }
            } else {
                topLevelComments.push(comment);
            }
        }

        // Ensure replies have their content populated, not just IDs
        const serializeComments = (comments: any[]): any[] => {
            return comments.map(comment => ({
                ...comment,
                replies: serializeComments(comment.replies)
            }));
        };

        return NextResponse.json(serializeComments(topLevelComments), { status: 200 });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}
