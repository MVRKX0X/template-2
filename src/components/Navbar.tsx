import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, signIn, signOut } = useAuth();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (user) {
      // In production, fetch points from Firebase
      setPoints(user.points || 0);
    }
  }, [user]);

  return (
    <nav className="bg-[#1F1F2B] border-b border-[#2A2A3A]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-[#E10600]">NXTBET</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/quiz" className="text-gray-300 hover:text-white">
              Quiz
            </Link>
            <Link href="/predictions" className="text-gray-300 hover:text-white">
              Predictions
            </Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-white">
              Leaderboard
            </Link>
            {user && (
              <Link href="/profile" className="text-gray-300 hover:text-white">
                Profile
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-[#E10600] font-bold">{points}</span>
                  <span className="text-gray-400">points</span>
                </div>
                <button
                  onClick={signOut}
                  className="bg-[#2A2A3A] text-white px-4 py-2 rounded-lg hover:bg-[#3A3A4A]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={signIn}
                className="bg-[#E10600] text-white px-4 py-2 rounded-lg hover:bg-[#B30500]"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 