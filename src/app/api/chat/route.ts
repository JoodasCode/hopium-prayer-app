import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userContext, message, userId, conversationId } = body;
    
    console.log('API received:', { 
      messagesType: typeof messages, 
      messagesArray: Array.isArray(messages),
      messagesLength: messages?.length,
      messageType: typeof message,
      bodyKeys: Object.keys(body)
    });
    
    // Handle both old and new request formats
    let chatMessages = messages;
    if (!chatMessages && message) {
      // Convert single message to messages array format
      chatMessages = [{ role: 'user', content: message }];
    }
    
    // Ensure we have a valid array of messages
    if (!chatMessages || !Array.isArray(chatMessages)) {
      console.error('Invalid messages format:', { chatMessages, message, body });
      return NextResponse.json(
        { error: 'Invalid messages format. Expected array of message objects.' },
        { status: 400 }
      );
    }
    
    // Validate message format
    const validMessages = chatMessages.filter(msg => 
      msg && typeof msg === 'object' && msg.role && msg.content
    );
    
    if (validMessages.length === 0) {
      console.error('No valid messages found:', chatMessages);
      return NextResponse.json(
        { error: 'No valid messages provided' },
        { status: 400 }
      );
    }

    // Build enhanced system prompt with personal context
    const systemPrompt = `You are Mulvi, an AI spiritual companion for Muslim prayer guidance. You are warm, knowledgeable, and supportive.

PERSONAL CONTEXT:
- User's name: ${userContext?.userName || 'friend'}
- Account age: ${userContext?.accountAge || 0} days
- Prayer method: ${userContext?.prayerMethod || 'ISNA'}
- Theme preference: ${userContext?.userTheme || 'serene'}

MOTIVATIONS & BACKGROUND:
${userContext?.motivations?.length > 0 ? `- Primary motivations: ${userContext.motivations.join(', ')}` : ''}
${userContext?.prayerStory ? `- Prayer story: ${userContext.prayerStory}` : ''}
${userContext?.intentions?.length > 0 ? `- Spiritual intentions: ${userContext.intentions.join(', ')}` : ''}

CURRENT PRAYER STATUS:
- Current streak: ${userContext?.currentStreak || 0} days
- Completion rate: ${Math.round((userContext?.completionRate || 0) * 100)}%
- Today's progress: ${userContext?.todayCompleted || 0}/${userContext?.todayTotal || 5} prayers
- Current time: ${userContext?.currentTime || 'unknown'} (${userContext?.currentPrayerPeriod || 'unknown period'})
- Next prayer: ${userContext?.nextPrayerInfo || 'upcoming'}
${userContext?.strugglingPrayers?.length > 0 ? `- Struggling with: ${userContext.strugglingPrayers.join(', ')} prayers` : ''}

PRAYER BASELINE:
${userContext?.prayerBaseline ? Object.entries(userContext.prayerBaseline).map(([prayer, consistent]) => `- ${prayer}: ${consistent ? 'consistent' : 'needs improvement'}`).join('\n') : ''}

PERSONALITY GUIDELINES:
1. **Use their name naturally** - Address them by name occasionally, but not in every response
2. **Reference their journey** - Acknowledge their motivations and prayer story when relevant
3. **Be contextually aware** - Consider their current streak, time of day, and struggling prayers
4. **Provide Islamic guidance** - Offer practical advice rooted in Islamic teachings
5. **Stay encouraging** - Always be supportive and motivating
6. **Redirect gently** - If they ask about non-Islamic topics, gently guide back to spiritual matters

RESPONSE STYLE:
- Warm and personal, using their name when appropriate
- Reference their specific challenges and motivations
- Provide actionable Islamic advice
- Keep responses concise but meaningful
- Use "MashaAllah" and other Islamic expressions naturally
- NEVER use markdown formatting like **bold** or *italic* - use natural language for emphasis
- When mentioning prayer names (Fajr, Dhuhr, Asr, Maghrib, Isha), use them naturally without special formatting
- Speak conversationally as if talking to a close friend

Remember: You know ${userContext?.userName || 'this person'} personally. Use their context to provide truly personalized spiritual guidance.`;

    console.log('Sending to OpenAI:', {
      messageCount: validMessages.length,
      systemPromptLength: systemPrompt.length
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...validMessages
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "I'm here to help with your prayer journey. How can I assist you today?";

    return NextResponse.json({ response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      apiKey: process.env.OPENAI_API_KEY ? 'Present' : 'Missing'
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 