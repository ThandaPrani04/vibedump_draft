import { NextRequest, NextResponse } from 'next/server';

interface ToxicityResponse {
  isToxic: boolean;
  confidence: number;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    // Call Hugging Face Inference API for Toxic-BERT
    const response = await fetch(
      'https://api-inference.huggingface.co/models/unitary/toxic-bert',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    
    // Toxic-BERT returns an array of classification results
    // Find the TOXIC label and check if confidence > 0.5 (50%)
    let toxicScore = 0;
    
    if (Array.isArray(result) && result.length > 0) {
      const toxicResult = result[0].find((item: any) => 
        item.label === 'TOXIC' || item.label === 'toxic'
      );
      
      if (toxicResult) {
        toxicScore = toxicResult.score;
      }
    }

    const isToxic = toxicScore > 0.5; // 50% threshold

    const response_data: ToxicityResponse = {
      isToxic,
      confidence: toxicScore,
      message: isToxic ? 'Post flagged for toxic behavior' : undefined,
    };

    return NextResponse.json(response_data);
  } catch (error) {
    console.error('Toxicity check error:', error);
    
    // In case of API failure, allow the content (fail-safe approach)
    return NextResponse.json({
      isToxic: false,
      confidence: 0,
      message: 'Moderation service temporarily unavailable',
    });
  }
}