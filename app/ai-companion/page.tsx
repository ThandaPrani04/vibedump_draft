'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, Bot, User, AlertTriangle, Plus, MessageCircle, Trash2, Mic, MicOff } from 'lucide-react';
import { Navigation } from '@/components/layout/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
}

export default function AICompanionPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadChats();
      checkSpeechSupport();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkSpeechSupport = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Failed to recognize speech. Please try again.",
          variant: "destructive",
        });
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setSpeechSupported(false);
    }
  };

  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    try {
      const response = await fetch('/api/ai/chats');
      const data = await response.json();
      if (data.success) {
        setChats(data.chats);
        if (data.chats.length === 0) {
          // Create a new chat if none exist
          await createNewChat();
        } else {
          // Load the most recent chat
          const mostRecentChat = data.chats[0];
          setCurrentChatId(mostRecentChat._id);
          setMessages(mostRecentChat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/ai/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Conversation' }),
      });
      const data = await response.json();
      if (data.success) {
        setCurrentChatId(data.chatId);
        setMessages([
          {
            role: 'assistant',
            content: "Hello! I'm your AI companion here to listen and support you. Feel free to share what's on your mind - I'm here to help you process your emotions in a safe space. 🌸",
            timestamp: new Date(),
          },
        ]);
        await loadChats(); // Refresh the chat list
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/ai/chats/${chatId}/messages`);
      const data = await response.json();
      if (data.success) {
        setCurrentChatId(chatId);
        setMessages(data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/ai/chats/${chatId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        if (currentChatId === chatId) {
          // If we're deleting the current chat, create a new one
          await createNewChat();
        }
        await loadChats(); // Refresh the chat list
        toast({
          title: "Chat deleted",
          description: "The conversation has been removed.",
        });
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !currentChatId) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          chatId: currentChatId 
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Check for crisis indicators (simple keyword detection)
      const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'not worth living', 'want to die'];
      const lowerMessage = input.toLowerCase();
      if (crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
        setShowCrisisAlert(true);
        toast({
          title: "Crisis Support Available",
          description: "If you're in crisis, please reach out to a mental health professional immediately.",
          variant: "destructive",
        });
      }

      // Refresh chat list to update last message
      await loadChats();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Please log in to access the AI Companion.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loadingChats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-[700px] bg-gray-200 rounded"></div>
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
        <div className="max-w-6xl mx-auto">
          {showCrisisAlert && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Crisis Support Resources:</strong>
                <ul className="mt-2 list-disc list-inside">
                  <li>National Suicide Prevention Lifeline: 988</li>
                  <li>Crisis Text Line: Text HOME to 741741</li>
                  <li>Emergency Services: 911</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat History Sidebar */}
            <div className="lg:col-span-1">
              <Card className="h-[700px] flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Conversations</CardTitle>
                    <Button size="sm" onClick={createNewChat}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-2">
                      {chats.map((chat) => (
                        <div
                          key={chat._id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                            currentChatId === chat._id
                              ? 'bg-purple-100 border border-purple-200'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => loadChat(chat._id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                <h3 className="font-medium text-sm truncate">
                                  {chat.title}
                                </h3>
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {chat.lastMessage || 'No messages yet'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(chat.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(chat._id);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-[700px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-purple-600" />
                    MindfulChat AI Companion
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-purple-100 text-purple-600">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          {message.role === 'user' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-3 justify-start">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-gray-100 px-4 py-2 rounded-lg">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="mt-4 flex gap-2">
                    {speechSupported && (
                      <Button
                        onClick={toggleVoiceRecording}
                        disabled={isLoading || !currentChatId}
                        size="icon"
                        variant={isListening ? "destructive" : "outline"}
                        className={isListening ? "animate-pulse" : ""}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    )}
                    <Input
                      placeholder={speechSupported ? "Type your message or use voice..." : "Type your message..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading || !currentChatId}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading || !currentChatId}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {isListening && (
                    <div className="mt-2 text-center">
                      <p className="text-sm text-purple-600 animate-pulse">
                        🎤 Listening... Speak now
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}