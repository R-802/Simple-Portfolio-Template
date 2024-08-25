import { NextResponse } from 'next/server';
import { db } from 'firebaseConfig';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';

export async function DELETE(
  request: Request,
  { params }: { params: { commentId: string } }
) {
  const { commentId } = params;

  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await deleteDoc(commentRef);

    return NextResponse.json({ message: 'Comment deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}