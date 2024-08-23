import { db } from 'firebaseConfig';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export async function POST(req) {
    try {
        const { postSlug, content, author, parentId } = await req.json();

        if (!postSlug || !content || !author) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
        }

        const commentData = {
            postSlug,
            content,
            author,
            createdAt: new Date().toISOString(),
            upvotes: 0,
            downvotes: 0,
        };

        if (parentId) {
            // This is a reply
            commentData.parentId = parentId;
            const replyDocRef = await addDoc(collection(db, 'comments'), commentData);
            const parentDocRef = doc(db, 'comments', parentId);
            await updateDoc(parentDocRef, {
                replies: arrayUnion(replyDocRef.id)
            });
            return new Response(JSON.stringify({ id: replyDocRef.id }), { status: 200 });
        } else {
            // This is a top-level comment
            commentData.replies = [];
            const docRef = await addDoc(collection(db, 'comments'), commentData);
            return new Response(JSON.stringify({ id: docRef.id }), { status: 200 });
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        return new Response(JSON.stringify({ error: 'Failed to submit comment' }), { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const postSlug = searchParams.get('postSlug');

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

        return new Response(JSON.stringify(topLevelComments), { status: 200 });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), { status: 500 });
    }
}
