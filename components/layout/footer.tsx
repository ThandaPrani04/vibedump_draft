import Link from 'next/link';
import { Heart, MessageCircle, Users, BookOpen, Bot } from 'lucide-react';

const footerLinks = [
  { href: '/', label: 'Home', icon: Heart },
  { href: '/blogs', label: 'Blogs', icon: BookOpen },
  { href: '/communities', label: 'Community', icon: Users },
  { href: '/ai-companion', label: 'AI Companion', icon: Bot },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold">VibeDump</span>
            </div>
            <p className="text-gray-400 mb-4">
              A safe space for emotional expression and community-based healing. Connect with others, 
              get AI support, and access mental health resources.
            </p>
            <div className="flex space-x-4">
              {footerLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <Icon className="h-6 w-6" />
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Crisis Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <strong>Crisis Lifeline:</strong> 988
              </li>
              <li>
                <strong>Crisis Text Line:</strong> Text HOME to 741741
              </li>
              <li>
                <strong>Emergency:</strong> 911
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 VibeDump. All rights reserved.</p>
          <p className="mt-2 text-sm">
            If you're in crisis, please reach out to a mental health professional immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}