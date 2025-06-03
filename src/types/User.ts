export interface User {
  id: string;
  username: string;
  email: string;
  karma: number;
  lastPostTime: string | null;
  availableInvites: number;
  createdAt: string;
  about?: string;
  invitedBy?: string;
}