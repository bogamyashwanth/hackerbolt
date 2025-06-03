import React from 'react';
import StoriesList from '../components/stories/StoriesList';
import { useStories } from '../contexts/StoriesContext';

const HomePage: React.FC = () => {
  const { stories, isLoading, error } = useStories();
  
  return (
    <div>
      <h1 className="sr-only">Top Stories</h1>
      <StoriesList
        stories={stories}
        isLoading={isLoading}
        error={error}
        showSortControls={true}
      />
    </div>
  );
};

export default HomePage;