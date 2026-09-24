import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  increment, 
  getDocFromServer,
  setDoc,
  getDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BlogComment } from '../types';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface FirebaseComment {
  id: string;
  articleId: string;
  author: string;
  petName?: string;
  content: string;
  likes: number;
  createdAt: string;
}

/**
 * Real-time listener for comments on a specific article
 */
export function subscribeToArticleComments(
  articleId: string, 
  callback: (comments: BlogComment[]) => void
) {
  const commentsRef = collection(db, 'comments');
  const q = query(commentsRef, where('articleId', '==', articleId));

  return onSnapshot(q, (snapshot) => {
    const comments: BlogComment[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      let formattedDate = 'Hoje';
      if (data.createdAt) {
        try {
          const d = new Date(data.createdAt);
          formattedDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        } catch (e) {
          formattedDate = 'Hoje';
        }
      }

      return {
        id: docSnap.id,
        author: data.author || 'Tutor Anônimo',
        petName: data.petName || undefined,
        content: data.content || '',
        date: formattedDate,
        likes: typeof data.likes === 'number' ? data.likes : 0,
      };
    });

    // Sort descending by id/time
    comments.sort((a, b) => b.id.localeCompare(a.id));
    callback(comments);
  }, (err) => {
    console.warn('Comments realtime subscription note:', err);
  });
}

/**
 * Add a new comment to Firestore (persists globally for all users)
 */
export async function addArticleComment(
  articleId: string,
  comment: Omit<BlogComment, 'id' | 'likes'>
): Promise<string> {
  const commentsRef = collection(db, 'comments');
  const docRef = await addDoc(commentsRef, {
    articleId,
    author: comment.author.trim() || 'Tutor',
    petName: comment.petName?.trim() || '',
    content: comment.content.trim(),
    likes: 0,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Like a comment in Firestore
 */
export async function likeArticleComment(commentId: string): Promise<void> {
  const commentRef = doc(db, 'comments', commentId);
  await updateDoc(commentRef, {
    likes: increment(1),
  });
}

/**
 * Real-time listener for article reactions
 */
export function subscribeToArticleReactions(
  articleId: string,
  callback: (reactions: { likes: number; pawReactions: number; usefulReactions: number }) => void
) {
  const reactionRef = doc(db, 'article_reactions', articleId);
  return onSnapshot(reactionRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({
        likes: Number(data.likes) || 0,
        pawReactions: Number(data.pawReactions) || 0,
        usefulReactions: Number(data.usefulReactions) || 0,
      });
    }
  }, (err) => {
    console.warn('Article reactions listener note:', err);
  });
}

/**
 * Increment reaction on an article in Firestore
 */
export async function incrementArticleReaction(
  articleId: string,
  type: 'likes' | 'pawReactions' | 'usefulReactions',
  currentCounts: { likes: number; pawReactions: number; usefulReactions: number }
): Promise<void> {
  const reactionRef = doc(db, 'article_reactions', articleId);
  const snap = await getDoc(reactionRef);
  if (!snap.exists()) {
    await setDoc(reactionRef, {
      articleId,
      likes: type === 'likes' ? (currentCounts.likes || 0) + 1 : (currentCounts.likes || 0),
      pawReactions: type === 'pawReactions' ? (currentCounts.pawReactions || 0) + 1 : (currentCounts.pawReactions || 0),
      usefulReactions: type === 'usefulReactions' ? (currentCounts.usefulReactions || 0) + 1 : (currentCounts.usefulReactions || 0),
    });
  } else {
    await updateDoc(reactionRef, {
      [type]: increment(1),
    });
  }
}
