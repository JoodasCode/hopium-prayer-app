'use client';

import { useState, useEffect } from 'react';
import { storeKnowledge, generateEmbedding } from '../../../lib/ai';
import { useSupabaseClient } from '../../../hooks/useSupabaseClient';
import KnowledgeSearch from '../../../components/KnowledgeSearch';

interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
  source?: string;
  tags?: string[];
  created_at: string;
}

export default function KnowledgeAdmin() {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lopi_knowledge')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching knowledge entries:', err);
      setError('Failed to load knowledge entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !content.trim()) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse tags from comma-separated string
      const tags = tagsInput.trim() ? tagsInput.split(',').map(tag => tag.trim()) : undefined;
      
      // Store the knowledge entry with embedding
      await storeKnowledge(topic, content, source || undefined, tags, supabase);
      
      // Reset form
      setTopic('');
      setContent('');
      setSource('');
      setTagsInput('');
      
      // Show success message
      setSuccess('Knowledge entry saved successfully!');
      
      // Refresh entries
      fetchEntries();
    } catch (err) {
      console.error('Error saving knowledge entry:', err);
      setError('Failed to save knowledge entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const regenerateEmbedding = async (id: string, content: string) => {
    try {
      setLoading(true);
      
      // Generate new embedding
      const embedding = await generateEmbedding(content, supabase);
      
      // Update the entry with the new embedding
      const { error } = await supabase
        .from('lopi_knowledge')
        .update({ 
          embedding,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      setSuccess(`Embedding regenerated for entry ${id}`);
    } catch (err) {
      console.error('Error regenerating embedding:', err);
      setError('Failed to regenerate embedding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Knowledge Base Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add Knowledge Entry</h2>
            
            {error && (
              <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                  Source (optional)
                </label>
                <input
                  type="text"
                  id="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated, optional)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="prayer, benefits, techniques"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={saving || !topic.trim() || !content.trim()}
              >
                {saving ? 'Saving...' : 'Save Knowledge Entry'}
              </button>
            </form>
          </div>
        </div>
        
        <div>
          <KnowledgeSearch />
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Existing Knowledge Entries</h2>
        
        {loading ? (
          <p>Loading entries...</p>
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="font-semibold text-lg">{entry.topic}</h3>
                <p className="text-gray-700 mb-2">{entry.content}</p>
                
                {entry.source && (
                  <p className="text-sm text-gray-500 mb-1">Source: {entry.source}</p>
                )}
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {entry.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>Created: {new Date(entry.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={() => regenerateEmbedding(entry.id, entry.content)}
                    className="px-2 py-1 text-blue-600 hover:text-blue-800"
                    disabled={loading}
                  >
                    Regenerate Embedding
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No knowledge entries found.</p>
        )}
      </div>
    </div>
  );
}
