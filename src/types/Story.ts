export interface Comment {
  id: string;
  text: string;
  user: string;
  createdAt: string;
  points: number;
  replies?: Comment[];
  voted?: 'up' | 'down' | null;
}

export interface Story {
  id: string;
  title: string;
  url: string | null;
  text: string | null;
  points: number;
  user: string;
  createdAt: string;
  commentCount: number;
  comments: Comment[];
  voted?: 'up' | 'down' | null;
}