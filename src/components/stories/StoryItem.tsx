import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChevronUp, MessageSquare, ExternalLink } from 'lucide-react';
import { Story } from '../../types/Story';
import { useAuth } from '../../contexts/AuthContext';
import { useStories } from '../../contexts/StoriesContext';

interface StoryItemProps {
  story: Story;
  rank?: number;
  compact?: boolean;
}

const StoryItem: React.FC<StoryItemProps> = ({ story, rank, compact = false }) => {
  const { isAuthenticated } = useAuth();
  const { voteStory } = useStories();
  const navigate = useNavigate();
  
  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    voteStory(story.id, story.voted === 'up' ? 'down' : 'up');
  };
  
  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(story.createdAt), { addSuffix: true });
  const domain = story.url ? getHostname(story.url) : null;
  
  return (
    <article className={`${compact ? 'py-2' : 'py-4'} border-b border-gray-100 dark:border-navy-800`}>
      <div className="flex">
        {rank !== undefined && (
          <span className="text-gray-500 dark:text-gray-400 font-mono w-10 text-right pr-2 flex-shrink-0">
            {rank}.
          </span>
        )}
        
        <div className="flex flex-col">
          <div className="flex items-start">
            <button 
              onClick={handleVote}
              className={`flex-shrink-0 p-1 rounded ${
                story.voted === 'up' 
                  ? 'text-primary-500' 
                  : 'text-gray-400 hover:text-primary-500'
              } transition-colors`}
              aria-label="Upvote"
            >
              <ChevronUp size={18} />
            </button>
            
            <div className="ml-1">
              <h2 className={`${compact ? 'text-base' : 'text-lg'} font-medium leading-tight`}>
                <Link 
                  to={story.url ? story.url : `/item/${story.id}`} 
                  className="hover:underline"
                  target={story.url ? "_blank" : undefined}
                  rel={story.url ? "noopener noreferrer" : undefined}
                >
                  {story.title}
                  {story.url && (
                    <ExternalLink size={14} className="inline-block ml-1 mb-0.5 text-gray-400" />
                  )}
                </Link>
              </h2>
              
              {domain && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  ({domain})
                </span>
              )}
              
              <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-2`}>
                <span>
                  {story.points} {story.points === 1 ? 'point' : 'points'}
                </span>
                <span>
                  by <Link to={`/user/${story.user}`} className="hover:underline">{story.user}</Link>
                </span>
                <span>{timeAgo}</span>
                <Link to={`/item/${story.id}`} className="hover:underline flex items-center">
                  <MessageSquare size={14} className="mr-1" />
                  {story.commentCount} {story.commentCount === 1 ? 'comment' : 'comments'}
                </Link>
              </div>
            </div>
          </div>
          
          {!compact && story.text && (
            <div className="mt-3 ml-8 text-sm text-gray-800 dark:text-gray-200">
              <p className="line-clamp-3">{story.text}</p>
              {story.text.length > 300 && (
                <Link to={`/item/${story.id}`} className="text-primary-500 hover:underline text-xs mt-1 inline-block">
                  Read more
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default StoryItem;