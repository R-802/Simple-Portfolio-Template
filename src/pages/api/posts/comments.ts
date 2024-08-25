import { db } from "firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default async function handler(req: { method: string; body: { content: any; author: any; postSlug: any; parentId: any; mentionedUsers: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; message?: string; id?: string; }): void; new(): any; }; }; }) {
    if (req.method === 'POST') {
        const { content, author, postSlug, parentId, mentionedUsers } = req.body;

        // Check if required fields are present
        if (!content || !author || !postSlug) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const commentsCollection = collection(db, 'comments');
            const newComment = {
                content,
                author,
                postSlug,
                createdAt: new Date().toISOString(),
                parentId: parentId || null,  // For replies
                mentionedUsers: mentionedUsers || [],
                upvotes: 0,
                downvotes: 0
            };

            const docRef = await addDoc(commentsCollection, newComment);

            res.status(200).json({ message: 'Comment added successfully', id: docRef.id });
        } catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).json({ error: 'Failed to add comment' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}