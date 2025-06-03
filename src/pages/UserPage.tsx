import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Award, ArrowLeft } from 'lucide-react';
import StoriesList from '../components/stories/StoriesList';
import { Story } from '../types/Story';
import { User } from '../types/User';

const UserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call for user data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock user data
        setUser({
          id: id || '1',
          username: id || 'username',
          email: `${id}@example.com`,
          karma: 1024,
          createdAt: '2022-01-15T12:00:00Z',
          about: 'Software developer with a passion for open source and web technologies.',
        });
        
        // Filter mock stories for this user
        setUserStories(mockStories.filter(story => story.user === id));
      } catch (error) {
        console.error('Failed to fetch user data', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchUserData();
    }
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-navy-700 rounded w-1/4 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-1/3 mb-6" />
          <div className="h-32 bg-gray-200 dark:bg-navy-700 rounded mb-6" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-500 dark:text-gray-400">User not found</p>
        <Link to="/" className="mt-4 inline-block text-primary-500 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }
  
  const memberSince = formatDistanceToNow(new Date(user.createdAt), { addSuffix: false });
  
  return (
    <div className="pb-10">
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6">
        <ArrowLeft size={16} className="mr-1" />
        Back to stories
      </Link>
      
      <div className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">{user.username}</h1>
          <div className="flex items-center text-primary-500">
            <Award size={20} className="mr-1" />
            <span className="font-semibold">{user.karma} karma</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Calendar size={16} className="mr-1" />
          <span>Member for {memberSince}</span>
        </div>
        
        {user.about && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-800 dark:text-gray-200">{user.about}</p>
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Submissions by {user.username}
        </h2>
        
        {userStories.length > 0 ? (
          <StoriesList stories={userStories} compact />
        ) : (
          <div className="py-8 text-center bg-white dark:bg-navy-900 rounded-lg shadow-sm">
            <p className="text-gray-500 dark:text-gray-400">No stories submitted yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;