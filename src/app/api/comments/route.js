import { db } from 'firebaseConfig';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';
import { adminDb, adminAuth } from 'firebaseAdmin';

export async function DELETE(req, { params }) {
    const { commentId } = params;
    if (!commentId) {
        return new Response(JSON.stringify({ error: 'Comment ID is required' }), { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return new Response(JSON.stringify({ error: 'Authorization token missing' }), { status: 401 });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const user = decodedToken; // Extract user details from token

        const commentRef = adminDb.collection('comments').doc(commentId);
        const commentSnap = await commentRef.get();

        if (!commentSnap.exists) {
            return new Response(JSON.stringify({ error: 'Comment not found' }), { status: 404 });
        }

        const comment = commentSnap.data();
        console.log('Comment UID:', comment.uid);
        console.log('Requesting User UID:', user.uid);

        if (comment.uid !== user.uid) {
            console.error('Unauthorized delete attempt. User UID does not match comment UID.');
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
        }

        await commentRef.delete();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error deleting comment:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return new Response(JSON.stringify({ error: 'Failed to delete comment' }), { status: 500 });
    }

}



export async function POST(req) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return new Response(JSON.stringify({ error: 'Authorization token missing' }), { status: 401 });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const user = decodedToken; // Extract user details from token
        const { postSlug, content, author, parentId } = await req.json();

        if (!postSlug || !content || !author) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
        }

        // Ensure the user is authenticated (we trust the token)
        // No need to check if `author === user.uid`, just authorize action
        const commentData = {
            postSlug,
            content,
            author,  // This is the display name, not the uid
            parentId: parentId || null,
            createdAt: new Date().toISOString(),
            uid: user.uid,  // Store uid separately for authorization
        };

        await adminDb.collection('comments').add(commentData);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error verifying token:', error);
        return new Response(JSON.stringify({ error: 'Failed to verify token' }), { status: 403 });
    }
}


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const postSlug = searchParams.get('postSlug');

        if (!postSlug) {
            return new Response(JSON.stringify({ error: 'Post slug is required' }), { status: 400 });
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
        const serializeComments = (comments) => {
            return comments.map(comment => ({
                ...comment,
                replies: serializeComments(comment.replies)
            }));
        };

        return new Response(JSON.stringify(serializeComments(topLevelComments)), { status: 200 });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), { status: 500 });
    }
}
