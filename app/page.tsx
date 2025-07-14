import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { Navigation } from '@/components/layout/navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <Hero />
      <Features />
    </div>
  );
}