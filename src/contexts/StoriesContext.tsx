import React, { createContext, useContext, useState, useEffect } from 'react';
import { Story } from '../types/Story';
import { supabase } from '../lib/supabase';

interface PostStats {
  post_id: string;
  upvotes: number;
  downvotes: number;
  total_votes: number;
  upvote_ratio: number;
  comment_count: number;
  engagement_score: number;
  last_updated: string;
}

const sampleStories: Story[] = [
  {
    id: '1',
    title: 'Introducing a New Framework for Web Development',
    url: 'https://example.com/framework',
    text: null,
    points: 128,
    user: 'techdev',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    commentCount: 45,
    comments: [],
    voted: null
  },
  {
    id: '2',
    title: 'The Future of AI in 2025',
    url: 'https://example.com/ai-future',
    text: null,
    points: 256,
    user: 'airesearcher',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    commentCount: 89,
    comments: [],
    voted: null
  },
  {
    id: '3',
    title: 'Show HN: I built a new programming language',
    url: null,
    text: 'After working for 2 years, I\'m excited to share my new programming language focused on developer productivity and safety.',
    points: 87,
    user: 'creator',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    commentCount: 34,
    comments: [],
    voted: null
  }
];

type SortOption = 'hot' | 'new' | 'top' | 'best';

interface StoriesContextType {
  stories: Story[];
  isLoading: boolean;
  error: string | null;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  getStoryById: (id: string) => Story | undefined;
  voteStory: (id: string, direction: 'up' | 'down') => void;
  submitStory: (title: string, url: string, text: string) => Promise<Story>;
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

export const StoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('new');
  const [totalPosts, setTotalPosts] = useState(0);

  // Fetch stories on mount
  useEffect(() => {
    const fetchStories = async () => {
      try {
        // Get total posts count
        const { count } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true });
        
        setTotalPosts(count || 0);

        // Fetch posts based on visibility rules
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            post_stats (*)
          `)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setStories(posts);
      } catch (error) {
        console.error('Error fetching stories:', error);
        setError('Failed to load stories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [sortOption]);

  // Get sorted stories based on sort option
  const getSortedStories = () => {
    // Common time periods
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // If less than 100 posts, only show new
    if (totalPosts < 100) {
      return [...stories].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    switch (sortOption) {
      case 'new':
        // Show posts from last 24 hours
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return stories
          .filter(story => new Date(story.createdAt) > dayAgo)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      case 'top':
        // Posts with 50+ upvotes in the last week
        return stories
          .filter(story => {
            const stats = story.post_stats as PostStats;
            return new Date(story.createdAt) > weekAgo && stats.upvotes >= 50;
          })
          .sort((a, b) => {
            const statsA = a.post_stats as PostStats;
            const statsB = b.post_stats as PostStats;
            return statsB.upvotes - statsA.upvotes;
          });

      case 'best':
        // Posts with high upvote ratio (80%+) and 25+ total votes in the last week
        return stories
          .filter(story => {
            const stats = story.post_stats as PostStats;
            return new Date(story.createdAt) > weekAgo && 
                   stats.total_votes >= 25 && 
                   stats.upvote_ratio >= 0.8;
          })
          .sort((a, b) => {
            const statsA = a.post_stats as PostStats;
            const statsB = b.post_stats as PostStats;
            return statsB.upvote_ratio - statsA.upvote_ratio;
          });

      case 'hot':
      default:
        // Posts with high engagement in last 48 hours
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        return stories
          .filter(story => {
            const stats = story.post_stats as PostStats;
            return new Date(story.createdAt) > twoDaysAgo && 
                   (stats.upvotes >= 10 || stats.comment_count >= 5);
          })
          .sort((a, b) => {
            const statsA = a.post_stats as PostStats;
            const statsB = b.post_stats as PostStats;
            return statsB.engagement_score - statsA.engagement_score;
          });
    }
  };

  // Get a story by ID
  const getStoryById = (id: string) => {
    return stories.find(story => story.id === id);
  };

  // Vote on a story
  const voteStory = (id: string, direction: 'up' | 'down') => {
    setStories(prevStories => 
      prevStories.map(story => {
        if (story.id === id) {
          return {
            ...story,
            points: story.points + (direction === 'up' ? 1 : -1),
            voted: direction === 'up' ? 'up' : direction === 'down' ? 'down' : null
          };
        }
        return story;
      })
    );
  };

  // Submit a new story
  const submitStory = async (title: string, url: string, text: string): Promise<Story> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newStory: Story = {
        id: `story-${Date.now()}`,
        title,
        url: url || null,
        text: text || null,
        points: 1,
        user: 'current-user', // Would use actual user
        createdAt: new Date().toISOString(),
        commentCount: 0,
        comments: [],
        voted: 'up', // Auto-upvote own submission
      };
      
      setStories(prev => [newStory, ...prev]);
      return newStory;
    } catch (error) {
      console.error('Failed to submit story', error);
      setError('Failed to submit story. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StoriesContext.Provider
      value={{
        stories: getSortedStories(),
        isLoading,
        error: null,
        sortOption,
        setSortOption,
        getStoryById,
        voteStory,
        submitStory
      }}
    >
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = (): StoriesContextType => {
  const context = useContext(StoriesContext);
  if (context === undefined) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
};