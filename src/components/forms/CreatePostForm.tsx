import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, Clock } from 'lucide-react';

const CreatePostForm: React.FC = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const getTimeUntilNextPost = () => {
    if (!user?.lastPostTime) return null;
    
    const lastPost = new Date(user.lastPostTime);
    const nextPost = new Date(lastPost.getTime() + 6 * 60 * 60 * 1000); // 6 hours
    const now = new Date();
    
    if (nextPost <= now) return null;
    
    const diff = nextPost.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const timeUntilNextPost = getTimeUntilNextPost();
  const canPost = !timeUntilNextPost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPost) return;
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Implementation will be added when we connect to Supabase
      setContent('');
    } catch (error) {
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-error-50 dark:bg-navy-800 text-error-500 p-3 rounded-md flex items-start">
          <AlertCircle size={18} className="flex-shrink-0 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="content" className="sr-only">
          Post content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={!canPost}
          rows={4}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md bg-white dark:bg-navy-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={canPost ? "What's on your mind?" : "You can post again in " + timeUntilNextPost}
        />
      </div>
      
      {timeUntilNextPost && (
        <div className="flex items-center text-sm text-warning-500">
          <Clock size={16} className="mr-1" />
          <span>You can post again in {timeUntilNextPost}</span>
        </div>
      )}
      
      <div>
        <button
          type="submit"
          disabled={!canPost || isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
};

export default CreatePostForm;