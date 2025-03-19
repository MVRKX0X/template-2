import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 text-[#E10600]">
            NXTBET F1
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Test your Formula 1 knowledge, make predictions, and compete with other fans!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            title="Weekly Quiz"
            description="Test your F1 knowledge with our weekly quiz and earn points"
            link="/quiz"
            icon="🎯"
          />
          <FeatureCard
            title="Race Predictions"
            description="Bet your points on race outcomes with dynamic odds"
            link="/predictions"
            icon="🏎️"
          />
          <FeatureCard
            title="Leaderboard"
            description="Compete with other fans and climb the global rankings"
            link="/leaderboard"
            icon="🏆"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, link, icon }: {
  title: string;
  description: string;
  link: string;
  icon: string;
}) {
  return (
    <Link href={link}>
      <div className="bg-[#1F1F2B] p-6 rounded-lg hover:bg-[#2A2A3A] transition-colors cursor-pointer">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </Link>
  );
}
