'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Navigation } from '@/components/layout/navigation';
import { ArrowLeft, MessageCircle, ThumbsUp, ThumbsDown, Clock, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  community_id: string;
  author: {
    display_name: string;
  };
  community: {
    name: string;
  };
  votes: {
    upvotes: number;
    downvotes: number;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    display_name: string;
  };
  votes: {
    upvotes: number;
    downvotes: number;
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchPostAndComments(params.id as string);
    }
  }, [params.id]);

  const fetchPostAndComments = async (postId: string) => {
    try {
      // 1. Fetch post details without votes
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!posts_user_id_fkey (display_name),
          community:communities!posts_community_id_fkey (name)
        `)
        .eq('id', postId)
        .single();
      if (postError) throw postError;

      // 2. Fetch post votes manually
      const { data: postVotes, error: postVotesError } = await supabase
        .from('votes')
        .select('value')
        .eq('target_id', postId)
        .eq('target_type', 'post');
      if (postVotesError) throw postVotesError;

      const postUpvotes = postVotes.filter(v => v.value === 1).length;
      const postDownvotes = postVotes.filter(v => v.value === -1).length;

      const fullPost: Post = {
        ...postData,
        votes: {
          upvotes: postUpvotes,
          downvotes: postDownvotes,
        },
      };
      setPost(fullPost);

      // 3. Fetch comments with user only
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          author:users!comments_user_id_fkey (display_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (commentsError) throw commentsError;

      // 4. Fetch comment votes manually
      const commentIds = commentsData.map((c: any) => c.id);
      const { data: commentVotes, error: commentVotesError } = await supabase
        .from('votes')
        .select('target_id, value')
        .in('target_id', commentIds)
        .eq('target_type', 'comment');
      if (commentVotesError) throw commentVotesError;

      const commentsWithVotes = commentsData.map((comment: any) => {
        const votes = commentVotes.filter(v => v.target_id === comment.id);
        const upvotes = votes.filter(v => v.value === 1).length;
        const downvotes = votes.filter(v => v.value === -1).length;
        return {
          ...comment,
          votes: { upvotes, downvotes },
        };
      });

      setComments(commentsWithVotes);
    } catch (error) {
      console.error('Error fetching post data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (targetId: string, targetType: 'post' | 'comment', value: number) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('votes')
        .upsert(
          { user_id: user.id, target_type: targetType, target_id: targetId, value },
          { onConflict: 'user_id,target_type,target_id' }
        );
      if (error) throw error;
      fetchPostAndComments(params.id as string);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

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

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    
    setIsSubmitting(true);
    setCommentError('');

    try {
      // Check toxicity of comment
      const toxicityCheck = await checkToxicity(newComment);
      
      if (toxicityCheck.isToxic) {
        setCommentError('Post flagged for toxic behavior');
        toast({
          title: "Comment Flagged",
          description: "Your comment contains inappropriate content. Please revise and try again.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('comments').insert({
        post_id: params.id,
        user_id: user.id,
        content: newComment,
      });
      if (error) throw error;

      setNewComment('');
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added to the discussion.',
      });
      fetchPostAndComments(params.id as string);
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Please log in to view this post.</p>
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
          <div className="max-w-4xl mx-auto animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
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
              <Link href={post ? `/communities/${post.community_id}` : '/communities'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Community
              </Link>
            </Button>

            {post && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span>r/{post.community.name}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  </div>
                  <CardTitle className="text-2xl">{post.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">{post.author.display_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">{post.author.display_name}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleVote(post.id, 'post', 1)} className="text-green-600 hover:text-green-700">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {post.votes.upvotes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleVote(post.id, 'post', -1)} className="text-red-600 hover:text-red-700">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {post.votes.downvotes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {comments.length} comments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Add Comment Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add a Comment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  {commentError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{commentError}</AlertDescription>
                    </Alert>
                  )}
                  <Button onClick={handleSubmitComment} disabled={!newComment.trim() || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking content...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Comments</h3>
              {comments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">No comments yet. Be the first to comment!</CardContent>
                </Card>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm">
                            {comment.author.display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">{comment.author.display_name}</span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2 whitespace-pre-wrap">{comment.content}</p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(comment.id, 'comment', 1)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {comment.votes.upvotes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(comment.id, 'comment', -1)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              {comment.votes.downvotes}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
