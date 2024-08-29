import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from 'firebaseAdmin';

// Correctly typed DELETE request handler using NextRequest
export async function DELETE(request: NextRequest, { params }: { params: { commentId: string } }): Promise<NextResponse> {
    const { commentId } = params;

    if (!commentId) {
        return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return NextResponse.json({ error: 'Authorization token missing' }, { status: 401 });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const user = decodedToken; // Extract user details from token

        const commentRef = adminDb.collection('comments').doc(commentId);
        const commentSnap = await commentRef.get();

        if (!commentSnap.exists) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        const comment = commentSnap.data();
        if (comment && comment.uid !== user.uid) {
            console.error('Unauthorized delete attempt. User UID does not match comment UID.');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await commentRef.delete();
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting comment:', error);
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
}
