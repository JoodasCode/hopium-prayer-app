// Test script for vector search functionality
require('dotenv').config({ path: __dirname + '/test.env' });
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embeddings for text using OpenAI's API
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Store test knowledge with embeddings
 */
async function storeTestKnowledge() {
  const testData = [
    {
      topic: 'Daily Prayer Benefits',
      content: 'Regular daily prayer has been shown to reduce stress and anxiety levels. It provides a moment of mindfulness and connection with a higher power that can center your thoughts and emotions.',
      source: 'Research Study',
      tags: ['prayer', 'benefits', 'stress-reduction']
    },
    {
      topic: 'Prayer Techniques',
      content: 'Different prayer techniques include contemplative prayer, intercessory prayer, gratitude prayer, and meditative prayer. Each serves a different spiritual purpose and can be practiced in various settings.',
      source: 'Prayer Guide',
      tags: ['techniques', 'methods', 'practice']
    },
    {
      topic: 'Community Prayer',
      content: 'Praying in community amplifies the spiritual experience and creates bonds between participants. Group prayer has been a cornerstone of religious practice across many faiths and traditions.',
      source: 'Community Guide',
      tags: ['community', 'group', 'connection']
    }
  ];

  console.log('Storing test knowledge entries...');
  
  for (const item of testData) {
    // Generate embedding for the content
    console.log(`Generating embedding for: ${item.topic}`);
    const embedding = await generateEmbedding(item.content);
    
    // Store in Supabase
    console.log(`Storing: ${item.topic}`);
    const { error } = await supabase.from('lopi_knowledge').insert({
      topic: item.topic,
      content: item.content,
      source: item.source,
      tags: item.tags,
      embedding,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error(`Error storing ${item.topic}:`, error);
    } else {
      console.log(`Successfully stored: ${item.topic}`);
    }
  }
}

/**
 * Test vector search
 */
async function testVectorSearch(query) {
  try {
    console.log(`Testing vector search with query: "${query}"`);
    
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    
    // Search using the database function
    console.log('Searching with search_knowledge_with_embedding function...');
    const { data: searchResults, error: searchError } = await supabase.rpc('search_knowledge_with_embedding', {
      query_embedding: embedding,
      match_threshold: 0.5,  // Lower threshold for testing
      match_count: 5
    });
    
    if (searchError) {
      console.error('Error searching knowledge:', searchError);
    } else {
      console.log('Search results:');
      console.log(JSON.stringify(searchResults, null, 2));
    }
    
    // Test the context function
    console.log('\nTesting get_lopi_context_with_vectors function...');
    const { data: contextResult, error: contextError } = await supabase.rpc('get_lopi_context_with_vectors', {
      input_user_id: '00000000-0000-0000-0000-000000000000',  // Use a dummy UUID for testing
      query_text: query,
      query_embedding: embedding
    });
    
    if (contextError) {
      console.error('Error getting context:', contextError);
    } else {
      console.log('Context result:');
      console.log(contextResult);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'store') {
    await storeTestKnowledge();
  } else if (command === 'search') {
    const query = args[1] || 'benefits of prayer';
    await testVectorSearch(query);
  } else {
    console.log('Usage: node test-vector-search.js [store|search] [query]');
    console.log('  store: Store test knowledge entries with embeddings');
    console.log('  search [query]: Test vector search with the given query');
  }
}

main().catch(console.error);
