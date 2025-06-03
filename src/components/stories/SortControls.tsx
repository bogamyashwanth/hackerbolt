import React, { useEffect, useState } from 'react';
import { useStories } from '../../contexts/StoriesContext';
import { Flame, Clock, TrendingUp, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SortControls: React.FC = () => {
  const { sortOption, setSortOption } = useStories();
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const fetchTotalPosts = async () => {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      
      setTotalPosts(count || 0);
    };

    fetchTotalPosts();
  }, []);

  const options = [
    { value: 'hot', label: 'Hot', icon: <Flame size={14} /> },
    { value: 'new', label: 'New', icon: <Clock size={14} /> },
    { value: 'top', label: 'Top', icon: <TrendingUp size={14} /> },
    { value: 'best', label: 'Best', icon: <Award size={14} /> },
  ] as const;

  // Only show 'new' option if less than 100 posts
  const visibleOptions = totalPosts < 100 
    ? options.filter(opt => opt.value === 'new')
    : options;

  return (
    <div className="flex items-center py-4 space-x-1 overflow-x-auto">
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Sort by:</span>
      <div className="flex space-x-1">
        {visibleOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSortOption(option.value)}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sortOption === option.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700'
            }`}
            aria-current={sortOption === option.value ? 'page' : undefined}
          >
            <span className="mr-1.5">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortControls;