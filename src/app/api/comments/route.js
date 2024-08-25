import { db } from 'firebaseConfig';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';

export async function DELETE(req, { params }) {
    const { commentId } = params;
    if (!commentId) {
        return new Response(JSON.stringify({ error: 'Comment ID is required' }), { status: 400 });
    }

    const user = req.user; // Get the authenticated user
    if (!user) {
        return new Response(JSON.stringify({ error: 'User not authenticated' }), { status: 401 });
    }

    try {
        const commentRef = doc(db, 'comments', commentId);
        const commentSnap = await getDoc(commentRef);

        if (!commentSnap.exists()) {
            return new Response(JSON.stringify({ error: 'Comment not found' }), { status: 404 });
        }

        const comment = commentSnap.data();
        if (comment.author !== user.uid) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
        }

        await deleteDoc(commentRef);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete comment' }), { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { postSlug, content, author, parentId } = await req.json();

        if (!postSlug || !content || !author) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
        }

        const commentData = {
            postSlug,
            content,
            author,  // Make sure this is correctly set on the client side
            createdAt: new Date().toISOString(),
            upvotes: 0,
            downvotes: 0,
            parentId: parentId || null,  // Properly handle parent-child relationships
            replies: [],
        };

        const docRef = await addDoc(collection(db, 'comments'), commentData);

        // If it's a reply, update the parent comment
        if (parentId) {
            const parentDocRef = doc(db, 'comments', parentId);
            await updateDoc(parentDocRef, {
                replies: arrayUnion(docRef.id),
            });
        }

        return new Response(JSON.stringify({ id: docRef.id }), { status: 200 });
    } catch (error) {
        console.error('Error submitting comment:', error);
        return new Response(JSON.stringify({ error: 'Failed to submit comment' }), { status: 500 });
    }
}


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const postSlug = searchParams.get('postSlug');

        if (!postSlug) {
            return new Response(JSON.stringify({ error: 'Post slug is required' }), { status: 400 });
        }

        const q = query(collection(db, 'comments'), where('postSlug', '==', postSlug));
        const querySnapshot = await getDocs(q);

        const commentsMap = new Map();
        const topLevelComments = [];

        // First pass: create all comment objects
        for (const docSnapshot of querySnapshot.docs) {
            const comment = { id: docSnapshot.id, ...docSnapshot.data(), replies: [] };
            commentsMap.set(comment.id, comment);
        }

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
