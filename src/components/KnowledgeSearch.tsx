'use client';

import { useState } from 'react';
import { searchKnowledge } from '../lib/ai';
import { useSupabaseClient } from '../hooks/useSupabaseClient';

interface KnowledgeResult {
  id: string;
  topic: string;
  content: string;
  similarity: number;
}

export default function KnowledgeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KnowledgeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = useSupabaseClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchKnowledge(query, supabase);
      setResults(searchResults);
    } catch (err) {
      console.error('Error searching knowledge:', err);
      setError('Failed to search knowledge base. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Knowledge Search</h2>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the knowledge base..."
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="p-3 border rounded-md">
              <h3 className="font-semibold text-lg">{result.topic}</h3>
              <div className="text-sm text-gray-500 mb-1">
                Similarity: {(result.similarity * 100).toFixed(1)}%
              </div>
              <p className="text-gray-700">{result.content}</p>
            </div>
          ))}
        </div>
      ) : query && !isLoading ? (
        <p className="text-gray-500">No results found. Try a different search term.</p>
      ) : null}
    </div>
  );
}
