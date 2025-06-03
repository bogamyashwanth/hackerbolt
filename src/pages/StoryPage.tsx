import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react';
import { useStories } from '../contexts/StoriesContext';
import CommentsList from '../components/comments/CommentsList';
import { Comment } from '../types/Story';
import { useAuth } from '../contexts/AuthContext';

const StoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getStoryById, voteStory } = useStories();
  const { isAuthenticated } = useAuth();
  
  const [story, setStory] = useState(id ? getStoryById(id) : undefined);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  
  useEffect(() => {
    const loadComments = async () => {
      setIsLoadingComments(true);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    };
  });

  if (!story) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-500 dark:text-gray-400">Story not found</p>
        <Link to="/" className="mt-4 inline-block text-primary-500 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }
  
  const timeAgo = formatDistanceToNow(new Date(story.createdAt), { addSuffix: true });
  
  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  };
  
  const domain = story.url ? getHostname(story.url) : null;
  
  const handleVote = () => {
    if (!isAuthenticated) {
      return;
    }
    voteStory(story.id, story.voted === 'up' ? 'down' : 'up');
    setStory(getStoryById(story.id));
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !isAuthenticated) {
      return;
    }
    
    // Simulate adding a comment
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      user: 'current-user', // Would use actual username
      createdAt: new Date().toISOString(),
      points: 1,
      replies: [],
    };
    
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
  };
  
  return (
    <div className="pb-10">
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6">
        <ArrowLeft size={16} className="mr-1" />
        Back to stories
      </Link>
      
      <article className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-6">
        <header className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold leading-tight mb-2">
            {story.title}
          </h1>
          
          {story.url && (
            <a 
              href={story.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary-500 hover:underline mb-3"
            >
              {domain}
              <ExternalLink size={14} className="ml-1" />
            </a>
          )}
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <button 
              onClick={handleVote}
              className={`mr-2 p-1 rounded ${
                story.voted === 'up' 
                  ? 'text-primary-500 bg-primary-50 dark:bg-navy-800' 
                  : 'text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-navy-800'
              }`}
              aria-label="Upvote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
            
            <span className="mr-2">
              {story.points} {story.points === 1 ? 'point' : 'points'}
            </span>
            <span className="mr-2">by</span>
            <Link to={`/user/${story.user}`} className="mr-2 hover:underline">
              {story.user}
            </Link>
            <span>{timeAgo}</span>
            
            <div className="ml-auto flex items-center">
              <MessageSquare size={16} className="mr-1" />
              <span>{comments.length} comments</span>
            </div>
          </div>
        </header>
        
        {story.text && (
          <div className="prose dark:prose-invert max-w-none mb-6 text-gray-800 dark:text-gray-200">
            <p>{story.text}</p>
          </div>
        )}
        
        {isAuthenticated && (
          <form onSubmit={handleSubmitComment} className="mt-6 mb-8">
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Add a comment
            </label>
            <textarea
              id="comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md bg-white dark:bg-navy-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Share your thoughts..."
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
              >
                Post Comment
              </button>
            </div>
          </form>
        )}
        
        <CommentsList comments={comments} isLoading={isLoadingComments} />
      </article>
    </div>
  );
};

export default StoryPage;