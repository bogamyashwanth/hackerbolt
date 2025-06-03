import React from 'react';
import CommentItem from './CommentItem';
import { Comment } from '../../types/Story';
import { useAuth } from '../../contexts/AuthContext';

interface CommentsListProps {
  comments: Comment[];
  isLoading?: boolean;
}

const CommentsList: React.FC<CommentsListProps> = ({ comments, isLoading = false }) => {
  const { isAuthenticated } = useAuth();
  
  if (isLoading) {
    return (
      <div className="py-4">
        <div className="animate-pulse space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex">
              <div className="w-8 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 dark:bg-navy-700 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-full mb-1" />
                <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (comments.length === 0) {
    return (
      <div className="py-6 text-center border-t border-gray-200 dark:border-navy-800">
        <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
        {isAuthenticated ? (
          <p className="mt-2 text-sm">Be the first to comment!</p>
        ) : (
          <p className="mt-2 text-sm">
            <a href="/login" className="text-primary-500 hover:underline">Sign in</a> to post a comment
          </p>
        )}
      </div>
    );
  }
  
  return (
    <div className="pt-4">
      <h3 className="text-lg font-semibold mb-4">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>
      <div className="space-y-0 divide-y divide-gray-100 dark:divide-navy-800">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentsList;