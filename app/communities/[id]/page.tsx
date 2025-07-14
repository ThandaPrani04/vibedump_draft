'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Navigation } from '@/components/layout/navigation';
import { ArrowLeft, MessageCircle, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: {
    display_name: string;
  };
  votes: {
    upvotes: number;
    downvotes: number;
  };
  comment_count: number;
}

interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

export default function CommunityDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCommunityAndPosts(params.id as string);
    }
  }, [params.id]);

  const fetchCommunityAndPosts = async (communityId: string) => {
    try {
      // Fetch community details
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();

      console.log('Community Data:', communityData);

      if (communityError) throw communityError;

      // Fetch posts
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Enrich each post with votes, author, and comment count
      const postsWithMeta = await Promise.all(
        (postsData || []).map(async (post) => {
          const [{ data: votesData }, { data: userData }, { count: commentCount }] = await Promise.all([
            supabase
              .from('votes')
              .select('value')
              .eq('target_type', 'post')
              .eq('target_id', post.id),

            supabase
              .from('users')
              .select('display_name')
              .eq('id', post.user_id)
              .single(),

            supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id),
          ]);

          const upvotes = votesData?.filter((v) => v.value === 1).length || 0;
          const downvotes = votesData?.filter((v) => v.value === -1).length || 0;

          return {
            ...post,
            author: {
              display_name: userData?.display_name || 'Unknown',
            },
            votes: {
              upvotes,
              downvotes,
            },
            comment_count: commentCount || 0,
          };
        })
      );

      setCommunity(communityData);
      setPosts(postsWithMeta);

    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, value: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('votes')
        .upsert(
          {
            user_id: user.id,
            target_type: 'post',
            target_id: postId,
            value,
          },
          { onConflict: 'user_id,target_type,target_id' }
        );

      if (error) throw error;

      // Refresh posts
      fetchCommunityAndPosts(params.id as string);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Please log in to access this community.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/communities">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Communities
              </Link>
            </Button>

            {community && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{community.name}</CardTitle>
                  <CardDescription>{community.description}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{community.member_count} members</span>
                    <Badge variant="secondary">Anonymous</Badge>
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Posts</h2>
              <Button asChild>
              <Link href={`/communities/${params.id}/create-post`}>
                Create Post
              </Link>
              </Button>
            </div>

            {posts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No posts yet. Be the first to share!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            <Link 
                              href={`/posts/${post.id}`}
                              className="hover:text-purple-600 transition-colors"
                            >
                              {post.title}
                            </Link>
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {post.content}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {post.author.display_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{post.author.display_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(post.id, 1)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.votes.upvotes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(post.id, -1)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            {post.votes.downvotes}
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/posts/${post.id}`}>
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comment_count}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}