import React, { useEffect } from 'react';
import StoriesList from '../components/stories/StoriesList';
import { useStories } from '../contexts/StoriesContext';

const NewestPage: React.FC = () => {
  const { stories, isLoading, error, setSortOption } = useStories();
  
  useEffect(() => {
    // Set sort option to new when this page loads
    setSortOption('new');
  }, [setSortOption]);
  
  return (
    <div>
      <h1 className="sr-only">Newest Stories</h1>
      <StoriesList
        stories={stories}
        isLoading={isLoading}
        error={error}
        showSortControls={false}
      />
    </div>
  );
};

export default NewestPage;