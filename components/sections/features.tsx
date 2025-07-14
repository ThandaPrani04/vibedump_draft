import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Heart, Users, Zap, BookOpen, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Anonymous & Safe',
    description: 'Share your thoughts without fear of judgment. Your privacy is our priority.',
    badge: 'Privacy First'
  },
  {
    icon: Heart,
    title: 'Empathetic AI',
    description: 'Get support from an AI trained to understand and respond with compassion.',
    badge: '24/7 Support'
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Connect with others who understand your experiences in focused support groups.',
    badge: 'Peer Support'
  },
  {
    icon: Zap,
    title: 'Crisis Detection',
    description: 'Advanced AI monitoring provides immediate crisis resources when needed.',
    badge: 'Safety Net'
  },
  {
    icon: BookOpen,
    title: 'Curated Resources',
    description: 'Access expert-reviewed mental health articles and educational content.',
    badge: 'Expert Content'
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat',
    description: 'Instant conversations with AI and community members for immediate support.',
    badge: 'Instant Help'
  }
];

export function Features() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose VibeDump?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We've built a comprehensive platform that combines the best of AI technology, 
            community support, and expert resources to help you on your healing journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-8 w-8 text-purple-600" />
                    <Badge variant="secondary">{feature.badge}</Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}