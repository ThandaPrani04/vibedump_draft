'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/layout/navigation';
import { supabase } from '@/lib/supabase';

export default function CreatePostPage() {
  const params = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  console.log(params.id);

  const handleCreatePost = async () => {
    console.log('iamhere');
    if (!title || !content) {
      setError('Please provide both title and content.');
      return;
    }

    console.log('Creating post with title:', title, 'and content:', content);
    setLoading(true);
    setError('');

    try {
      console.log('Creating post with title:', title, 'and content:', content);
      // Validate community ID
      if (!params.id) {
        throw new Error('Community ID is required.');
      }
      // Fetch user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      
      console.log('User:', user);
      console.log('User Error:', userError);
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Validate community_id format
      const communityId = params.id;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(communityId as string)) {
        throw new Error('Invalid community ID');
      }
      console.log('Community ID:', communityId);

      console.log('Inserting post with', {
        title,
        content,
        community_id: communityId,
        user_id: user.id,
      });
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
            if (insertError) {
        console.error('Supabase Insert Error:', insertError);
        throw insertError;
      }

      router.push(`/communities/${communityId}`);
    } catch (err: any) {
      console.error('Error creating post:', err.message || err);
      setError('Failed to create post.');
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
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {/* <Button type="button" onClick={handleCreatePost} disabled={loading}>
                {loading ? 'Posting...' : 'Post'}
              </Button> */}
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault(); // Prevent any default form submission or reload
                  handleCreatePost();
                }}
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
