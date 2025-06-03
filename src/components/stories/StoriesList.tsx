import React from 'react';
import StoryItem from './StoryItem';
import SortControls from './SortControls';
import { Story } from '../../types/Story';

interface StoriesListProps {
  stories: Story[];
  isLoading?: boolean;
  error?: string | null;
  showSortControls?: boolean;
  compact?: boolean;
}

const StoriesList: React.FC<StoriesListProps> = ({ 
  stories, 
  isLoading = false, 
  error = null,
  showSortControls = true,
  compact = false
}) => {
  if (isLoading) {
    return (
      <div className="py-10">
        <div className="animate-pulse space-y-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex">
              <div className="w-10 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-navy-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 dark:bg-navy-800 border border-error-500 text-error-900 dark:text-error-500 p-4 rounded-md my-4">
        <p>{error}</p>
        <button className="mt-2 text-sm underline">Retry</button>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-500 dark:text-gray-400">No stories found</p>
      </div>
    );
  }

  return (
    <div>
      {showSortControls && <SortControls />}
      <div className="space-y-0 divide-y divide-gray-100 dark:divide-navy-800">
        {stories.map((story, index) => (
          <StoryItem 
            key={story.id} 
            story={story} 
            rank={index + 1}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
};

export default StoriesList;