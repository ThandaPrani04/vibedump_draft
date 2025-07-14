import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Crisis keywords for monitoring
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'not worth living', 'want to die',
  'better off dead', 'self harm', 'hurt myself', 'no point', 'give up'
];

function analyzeSentiment(message: string): 'positive' | 'negative' | 'neutral' | 'crisis' {
  const lowerMessage = message.toLowerCase();
  
  // Check for crisis indicators
  if (CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
    return 'crisis';
  }
  
  // Simple sentiment analysis (could be enhanced with ML)
  const positiveWords = ['happy', 'good', 'great', 'better', 'thanks', 'grateful'];
  const negativeWords = ['sad', 'bad', 'terrible', 'worse', 'depressed', 'anxious'];
  
  const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Analyze sentiment
    const sentiment = analyzeSentiment(message);

    // Craft system prompt for empathetic AI
    const systemPrompt = `You are an empathetic AI companion designed to provide emotional support and mental health guidance. 
    Your role is to:
    - Listen actively and validate emotions
    - Provide compassionate, non-judgmental responses
    - Offer practical coping strategies when appropriate
    - Encourage professional help when needed
    - Never provide medical advice or diagnose conditions
    - Be supportive, warm, and understanding
    
    If someone expresses suicidal thoughts or self-harm, immediately provide crisis resources and encourage seeking professional help.
    
    Keep responses conversational, empathetic, and supportive. Focus on understanding and validating their experience.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I understand you\'re reaching out. Could you tell me more about what\'s on your mind?';

    // Add crisis resources if needed
    let finalResponse = response;
    if (sentiment === 'crisis') {
      finalResponse += '\n\n🚨 **Crisis Resources:**\n- National Suicide Prevention Lifeline: 988\n- Crisis Text Line: Text HOME to 741741\n- Emergency Services: 911\n\nPlease reach out to a mental health professional or trusted person in your life. You don\'t have to go through this alone.';
    }

    return NextResponse.json({
      response: finalResponse,
      sentiment,
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}