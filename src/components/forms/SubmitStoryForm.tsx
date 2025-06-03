import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStories } from '../../contexts/StoriesContext';
import { Link, AlertCircle } from 'lucide-react';

type StoryType = 'url' | 'text';

const SubmitStoryForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [storyType, setStoryType] = useState<StoryType>('url');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { submitStory } = useStories();
  const navigate = useNavigate();
  
  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (storyType === 'url' && !url.trim()) {
      setError('URL is required for link submissions');
      return false;
    }
    
    if (storyType === 'text' && !text.trim()) {
      setError('Text content is required for text submissions');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const story = await submitStory(title, url, text);
      navigate(`/item/${story.id}`);
    } catch (error) {
      setError('Failed to submit story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-error-50 dark:bg-navy-800 text-error-500 p-3 rounded-md flex items-start">
          <AlertCircle size={18} className="flex-shrink-0 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="block w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md bg-white dark:bg-navy-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="A great title for your submission"
        />
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStoryType('url')}
          className={`flex-1 py-2 px-4 text-center rounded-md ${
            storyType === 'url'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700'
          }`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => setStoryType('text')}
          className={`flex-1 py-2 px-4 text-center rounded-md ${
            storyType === 'text'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700'
          }`}
        >
          Text
        </button>
      </div>
      
      {storyType === 'url' && (
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-1">
            URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link size={18} className="text-gray-400" />
            </div>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required={storyType === 'url'}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md bg-white dark:bg-navy-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com/article"
            />
          </div>
        </div>
      )}
      
      {storyType === 'text' && (
        <div>
          <label htmlFor="text" className="block text-sm font-medium mb-1">
            Text
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required={storyType === 'text'}
            rows={8}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md bg-white dark:bg-navy-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Share your thoughts, story, or question..."
          />
        </div>
      )}
      
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>
          Before submitting, please review our{' '}
          <a href="/guidelines" className="text-primary-500 hover:underline">
            submission guidelines
          </a>
          .
        </p>
      </div>
    </form>
  );
};

export default SubmitStoryForm;