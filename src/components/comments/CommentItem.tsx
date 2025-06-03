import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChevronUp, ChevronDown, Reply, MoreHorizontal } from 'lucide-react';
import { Comment } from '../../types/Story';
import { useAuth } from '../../contexts/AuthContext';

interface CommentItemProps {
  comment: Comment;
  level?: number;
  maxLevel?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  level = 0, 
  maxLevel = 3 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  
  // Calculate indentation
  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 12)}` : '';
  
  // Toggle comment collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Toggle reply form
  const toggleReply = () => {
    if (!isAuthenticated) {
      // Redirect to login or show login prompt
      return;
    }
    setIsReplyOpen(!isReplyOpen);
  };
  
  return (
    <div className={`py-3 ${level > 0 ? 'border-l-2 border-gray-200 dark:border-navy-700 pl-4' : ''}`}>
      <div className="flex items-start">
        <button 
          onClick={toggleCollapse} 
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label={isCollapsed ? 'Expand comment' : 'Collapse comment'}
        >
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        
        <div className="ml-2 flex-1">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Link to={`/user/${comment.user}`} className="font-medium hover:underline">
              {comment.user}
            </Link>
            <span className="mx-1">•</span>
            <span>{timeAgo}</span>
            <span className="mx-1">•</span>
            <span>{comment.points} {comment.points === 1 ? 'point' : 'points'}</span>
            
            <div className="ml-auto flex items-center">
              <button 
                onClick={toggleReply}
                className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
                aria-label="Reply"
              >
                <Reply size={14} />
              </button>
              
              <div className="relative group">
                <button
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal size={14} />
                </button>
                <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-navy-800 ring-1 ring-black ring-opacity-5 hidden group-hover:block animate-fade-in z-10">
                  <div className="py-1">
                    <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-navy-700">
                      Permalink
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-navy-700">
                      Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {!isCollapsed && (
            <>
              <div className="mt-2 text-sm text-gray-800 dark:text-gray-200 comment-text">
                <p>{comment.text}</p>
              </div>
              
              {isReplyOpen && (
                <div className="mt-4">
                  <textarea
                    placeholder="Write your reply..."
                    className="w-full p-3 border border-gray-300 dark:border-navy-600 rounded-md bg-white dark:bg-navy-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <button 
                      onClick={() => setIsReplyOpen(false)}
                      className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              )}
              
              {comment.replies && comment.replies.length > 0 && level < maxLevel && (
                <div className="mt-3 space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem 
                      key={reply.id} 
                      comment={reply} 
                      level={level + 1}
                      maxLevel={maxLevel}
                    />
                  ))}
                </div>
              )}
              
              {comment.replies && comment.replies.length > 0 && level >= maxLevel && (
                <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-navy-700">
                  <button className="text-xs text-primary-500 hover:underline">
                    Show {comment.replies.length} more {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;