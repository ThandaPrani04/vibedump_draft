/**
 * Content Moderation Utilities
 * Handles toxicity detection and content filtering
 */

export interface ToxicityResult {
  isToxic: boolean;
  confidence: number;
  message?: string;
}

/**
 * Check if content is toxic using Hugging Face Toxic-BERT model
 */
export async function checkContentToxicity(text: string): Promise<ToxicityResult> {
  try {
    const response = await fetch('/api/moderation/toxic-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Moderation API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Toxicity check failed:', error);
    // Fail-safe: allow content if check fails
    return {
      isToxic: false,
      confidence: 0,
      message: 'Moderation service temporarily unavailable',
    };
  }
}

/**
 * Validate content before posting
 */
export async function validateContent(content: string, type: 'post' | 'comment' = 'post'): Promise<{
  isValid: boolean;
  error?: string;
}> {
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      error: `${type === 'post' ? 'Post' : 'Comment'} content cannot be empty`,
    };
  }

  const toxicityResult = await checkContentToxicity(content);
  
  if (toxicityResult.isToxic) {
    return {
      isValid: false,
      error: 'Post flagged for toxic behavior',
    };
  }

  return { isValid: true };
}

/**
 * Content moderation middleware for API routes
 */
export async function moderateContent(content: string): Promise<boolean> {
  const result = await checkContentToxicity(content);
  return !result.isToxic;
}