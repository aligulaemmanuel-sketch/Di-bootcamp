export interface User {
  id: string;
  email?: string;
  username: string;
  bio?: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export type CollaboratorRole = "OWNER" | "EDITOR" | "VIEWER";

export interface Collaborator {
  userId?: string;
  role: CollaboratorRole;
  user: { id: string; username: string; avatarUrl?: string | null };
}

export interface Story {
  id: string;
  title: string;
  content: string;
  genre: string;
  commentsEnabled: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; username: string; avatarUrl?: string | null };
  collaborators: Collaborator[];
  _count?: { comments: number };
}

export interface CommentItem {
  id: string;
  storyId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; username: string; avatarUrl?: string | null };
  reactions: { userId: string; emoji: string; user: { id: string; username: string } }[];
}

export interface StoryVersion {
  id: string;
  versionNumber: number;
  title: string;
  content: string;
  label: string;
  createdAt: string;
  savedBy: { username: string };
}

export interface PresenceUser {
  userId: string;
  username: string;
  color: string;
}
