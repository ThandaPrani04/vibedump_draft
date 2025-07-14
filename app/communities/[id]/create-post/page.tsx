'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navigation } from '@/components/layout/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function CreatePostPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkToxicity = async (text: string): Promise<{ isToxic: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/moderation/toxic-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Toxicity check failed:', error);
      return { isToxic: false }; // Fail-safe: allow content if check fails
    }
  };

  const handleCreatePost = async () => {
    if (!title || !content) {
      setError('Please provide both title and content.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check toxicity of title and content
      const titleCheck = await checkToxicity(title);
      const contentCheck = await checkToxicity(content);

      if (titleCheck.isToxic) {
        setError('Post flagged for toxic behavior in title');
        toast({
          title: "Content Flagged",
          description: "Your post title contains inappropriate content. Please revise and try again.",
          variant: "destructive",
        });
        return;
      }

      if (contentCheck.isToxic) {
        setError('Post flagged for toxic behavior in content');
        toast({
          title: "Content Flagged",
          description: "Your post content contains inappropriate content. Please revise and try again.",
          variant: "destructive",
        });
        return;
      }

      // Validate community ID
      if (!params.id) {
        throw new Error('Community ID is required.');
      }

      // Fetch user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Validate community_id format
      const communityId = params.id;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(communityId as string)) {
        throw new Error('Invalid community ID');
      }

      // Insert post
      const { error: insertError } = await supabase.from('posts').insert([
        {
          title,
          content,
          community_id: communityId,
          user_id: user.id,
        },
      ]);

      if (insertError) throw insertError;

      toast({
        title: "Post Created",
        description: "Your post has been published successfully.",
      });

      router.push(`/communities/${communityId}`);
    } catch (err: any) {
      console.error('Error creating post:', err.message || err);
      setError(err.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="What's on your mind?"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault(); // Prevent any default form submission or reload
                  handleCreatePost();
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking content...
                  </>
                ) : (
                  'Post'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
