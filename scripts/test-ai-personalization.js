/**
 * Test script for AI assistant personalization features
 * 
 * This script tests the personalization features of the Lopi AI assistant,
 * including vector search integration and user display name personalization.
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Database } from '../src/types/supabase';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('Missing OpenAI API key');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: openaiApiKey });

/**
 * Generate embedding for text using OpenAI API
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Search knowledge base using vector similarity
 */
async function searchKnowledge(query, limit = 5) {
  try {
    // Generate embedding for query
    const embedding = await generateEmbedding(query);
    
    // Search using vector similarity
    const { data, error } = await supabase.rpc('search_knowledge_with_embedding', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching knowledge:', error);
    throw error;
  }
}

/**
 * Personalize a response with user's display name
 */
function personalizeResponse(response, displayName) {
  if (!displayName) return response;
  
  // Only add name sometimes to avoid being repetitive (70% chance)
  if (Math.random() > 0.3) {
    if (response.includes('\n\n')) {
      // Add name before a paragraph break
      return response.replace('\n\n', `, ${displayName}.\n\n`);
    } else {
      // Add at the beginning if no good spot found
      return `${displayName}, ${response.charAt(0).toLowerCase()}${response.slice(1)}`;
    }
  }
  
  return response;
}

/**
 * Test vector search functionality
 */
async function testVectorSearch() {
  console.log('\n===== Testing Vector Search =====');
  
  const queries = [
    'How to maintain focus during prayer',
    'Benefits of regular prayer',
    'Dealing with distractions while praying'
  ];
  
  for (const query of queries) {
    console.log(`\nQuery: "${query}"`);
    try {
      const results = await searchKnowledge(query, 2);
      
      if (results.length > 0) {
        console.log(`Found ${results.length} results:`);
        results.forEach((result, i) => {
          console.log(`\n${i + 1}. Topic: ${result.topic}`);
          console.log(`   Similarity: ${(result.similarity * 100).toFixed(2)}%`);
          console.log(`   Content: ${result.content.substring(0, 100)}...`);
        });
      } else {
        console.log('No results found.');
      }
    } catch (error) {
      console.error(`Error searching for "${query}":`, error);
    }
  }
}

/**
 * Test personalization functionality
 */
async function testPersonalization() {
  console.log('\n===== Testing Personalization =====');
  
  const responses = [
    "Prayer is a spiritual practice that helps connect with the divine. It provides a moment of reflection and peace in our busy lives.",
    "The five daily prayers in Islam are Fajr, Dhuhr, Asr, Maghrib, and Isha. Each has its specific time and significance.",
    "Maintaining focus during prayer can be challenging. Try to create a quiet space and clear your mind before beginning."
  ];
  
  const displayNames = ['Ahmed', 'Fatima', 'Ibrahim', null];
  
  for (const response of responses) {
    console.log(`\nOriginal response: "${response.substring(0, 50)}..."`);
    
    for (const name of displayNames) {
      if (name) {
        const personalized = personalizeResponse(response, name);
        console.log(`Personalized for ${name}: "${personalized.substring(0, 50)}..."`);
      } else {
        console.log(`Without name: "${response.substring(0, 50)}..."`);
      }
    }
  }
}

/**
 * Test combined vector search and personalization
 */
async function testCombined() {
  console.log('\n===== Testing Combined Functionality =====');
  
  const queries = [
    'How to improve prayer concentration',
    'What are the benefits of daily prayer'
  ];
  
  const displayNames = ['Yusuf', 'Aisha'];
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const name = displayNames[i % displayNames.length];
    
    console.log(`\nQuery: "${query}" (User: ${name})`);
    
    try {
      // Get knowledge from vector search
      const results = await searchKnowledge(query, 1);
      
      if (results.length > 0) {
        // Create a mock response with the knowledge
        const mockResponse = `Here's some guidance on that topic. ${results[0].content.substring(0, 150)}...`;
        
        // Personalize the response
        const personalizedResponse = personalizeResponse(mockResponse, name);
        
        console.log('\nPersonalized Response:');
        console.log(personalizedResponse);
      } else {
        console.log('No knowledge found for personalization.');
      }
    } catch (error) {
      console.error(`Error processing query "${query}":`, error);
    }
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('Starting AI personalization tests...');
  
  try {
    // Test vector search
    await testVectorSearch();
    
    // Test personalization
    await testPersonalization();
    
    // Test combined functionality
    await testCombined();
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
runTests();
