import { NextRequest, NextResponse } from 'next/server';
import { db } from 'firebaseConfig';  // Ensure this is server-side compatible
import { doc, updateDoc, increment } from 'firebase/firestore';
import { adminAuth } from 'firebaseAdmin';

interface VoteRequestBody {
    voteType: 'upvote' | 'downvote';
}

export async function POST(
    request: NextRequest,
    { params }: { params: { commentId: string } }
): Promise<NextResponse> {
    const { commentId } = params;
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (!token) {
        return NextResponse.json({ error: 'Authorization token missing' }, { status: 401 });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        console.log("Decoded Token:", decodedToken);

        const body: VoteRequestBody = await request.json();
        const { voteType } = body;
        console.log("Vote Type:", voteType);

        if (!commentId || (voteType !== 'upvote' && voteType !== 'downvote')) {
            console.error("Invalid data:", { commentId, voteType });
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const commentRef = doc(db, 'comments', commentId);
        const fieldToUpdate = voteType === 'upvote' ? 'upvotes' : 'downvotes';
        console.log("Field to Update:", fieldToUpdate);

        try {
            await updateDoc(commentRef, { [fieldToUpdate]: increment(1) });
            console.log(`Successfully updated ${fieldToUpdate} for comment ${commentId}`);
        } catch (error) {
            console.error("Error during Firestore update:", error);
            return NextResponse.json({ error: 'Failed to update vote count', details: (error as any).message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Vote registered successfully' }, { status: 200 });
    } catch (error: any) {
        if (error.code === 'permission-denied') {
            console.error("Permission denied:", error);
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }
        console.error("Error in voting process:", error);
        return NextResponse.json({ error: 'Failed to register vote' }, { status: 500 });
    }
}
