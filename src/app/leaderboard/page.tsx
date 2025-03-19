'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard, User } from '@/lib/firebase/firebaseUtils';
import Navbar from '@/components/Navbar';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const leaderboardData = await getLeaderboard(20); // Get top 20 users
        setUsers(leaderboardData);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-[#E10600]">Leaderboard</h1>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="bg-[#1F1F2B] rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-4 bg-[#2A2A3A] font-bold">
              <div>Rank</div>
              <div>Player</div>
              <div className="text-right">Points</div>
              <div className="text-right">Member Since</div>
            </div>

            {users.map((user, index) => (
              <div
                key={user.uid}
                className="grid grid-cols-4 gap-4 p-4 border-b border-[#2A2A3A] hover:bg-[#2A2A3A] transition-colors"
              >
                <div className="flex items-center">
                  {index + 1 === 1 && '🥇'}
                  {index + 1 === 2 && '🥈'}
                  {index + 1 === 3 && '🥉'}
                  {index + 1 > 3 && `#${index + 1}`}
                </div>
                <div className="truncate">{user.displayName}</div>
                <div className="text-right font-bold text-[#E10600]">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-right text-gray-400">
                  {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 