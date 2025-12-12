// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/server/embeddings';
import { generateChatResponse } from '@/lib/server/openrouter';
import { searchSimilarQAs } from '@/lib/server/supabase';

// Define the expected type for search results
interface QASearchResult {
  question: string;
  answer: string;
  similarity: number;
  category?: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log(`User question: "${question}"`);

    // Step 1: Generate embedding for the question
    console.log('Generating embedding...');
    const questionEmbedding = await generateEmbedding(question);

    // Step 2: Search for similar Q&As
    console.log('Searching for similar Q&As...');
    const searchResults = await searchSimilarQAs(questionEmbedding, 0.3, 3);

    // Type the results properly
    const similarQAs: QASearchResult[] = searchResults.map((result: Record<string, unknown>) => ({
      question: (result.question as string) || '',
      answer: (result.answer as string) || '',
      similarity: (result.similarity as number) || 0,
      category: result.category as string | undefined,
      tags: result.tags as string[] | undefined,
    }));

    console.log(`Found ${similarQAs.length} similar Q&As`);
    similarQAs.forEach((qa: QASearchResult, i: number) => {
      console.log(
        `   ${i + 1}. "${qa.question}" (similarity: ${qa.similarity?.toFixed(2)})`
      );
    });

    // Step 3: Generate response using context
    console.log('Generating response...');
    const response = await generateChatResponse(question, similarQAs);

    console.log(`Generated response: "${response.substring(0, 100)}..."`);

    return NextResponse.json({
      question,
      similarQAs: similarQAs.map((qa: QASearchResult) => ({
        question: qa.question,
        answer: qa.answer,
        similarity: qa.similarity,
      })),
      response,
      debug: {
        embeddingLength: questionEmbedding.length,
        searchResults: similarQAs.length,
        responseLength: response.length,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process question',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support GET for quick testing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const question = searchParams.get('q') || 'Who are you?';

    console.log(`User question: "${question}"`);

    // Step 1: Generate embedding for the question
    console.log('Generating embedding...');
    const questionEmbedding = await generateEmbedding(question);

    // Step 2: Search for similar Q&As
    console.log('Searching for similar Q&As...');
    const searchResults = await searchSimilarQAs(questionEmbedding, 0.3, 3);

    // Type the results properly
    const similarQAs: QASearchResult[] = searchResults.map((result: Record<string, unknown>) => ({
      question: (result.question as string) || '',
      answer: (result.answer as string) || '',
      similarity: (result.similarity as number) || 0,
      category: result.category as string | undefined,
      tags: result.tags as string[] | undefined,
    }));

    console.log(`Found ${similarQAs.length} similar Q&As`);
    similarQAs.forEach((qa: QASearchResult, i: number) => {
      console.log(
        `   ${i + 1}. "${qa.question}" (similarity: ${qa.similarity?.toFixed(2)})`
      );
    });

    // Step 3: Generate response using context
    console.log('Generating response...');
    const response = await generateChatResponse(question, similarQAs);

    console.log(`Generated response: "${response.substring(0, 100)}..."`);

    return NextResponse.json({
      question,
      similarQAs: similarQAs.map((qa: QASearchResult) => ({
        question: qa.question,
        answer: qa.answer,
        similarity: qa.similarity,
      })),
      response,
      debug: {
        embeddingLength: questionEmbedding.length,
        searchResults: similarQAs.length,
        responseLength: response.length,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process question',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
