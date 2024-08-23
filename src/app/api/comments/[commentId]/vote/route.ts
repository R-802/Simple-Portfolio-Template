import { db } from 'firebaseConfig';
import { doc, updateDoc, increment } from 'firebase/firestore';

export async function POST(req: Request, { params }: { params: { commentId: string } }) {
    try {
        const { commentId } = params;
        const { voteType } = await req.json();

        if (!commentId || !voteType) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
        }

        const commentRef = doc(db, 'comments', commentId);

        if (voteType === 'upvote') {
            await updateDoc(commentRef, {
                upvotes: increment(1)
            });
        } else if (voteType === 'downvote') {
            await updateDoc(commentRef, {
                downvotes: increment(1)
            });
        } else {
            return new Response(JSON.stringify({ error: 'Invalid vote type' }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error voting on comment:', error);
        return new Response(JSON.stringify({ error: 'Failed to vote on comment' }), { status: 500 });
    }
}