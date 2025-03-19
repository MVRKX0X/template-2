'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { User, UserBet, Prediction, getUserProfile, getUserBettingHistory, getUserStats } from '@/lib/firebase/firebaseUtils';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [bettingHistory, setBettingHistory] = useState<(UserBet & { prediction: Prediction })[]>([]);
  const [stats, setStats] = useState({
    totalBets: 0,
    winningBets: 0,
    totalPointsWon: 0,
    totalPointsLost: 0,
    favoriteCategory: '',
    bestCircuit: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [profile, history, userStats] = await Promise.all([
          getUserProfile(user.uid),
          getUserBettingHistory(user.uid),
          getUserStats(user.uid)
        ]);

        setUserProfile(profile);
        setBettingHistory(history);
        setStats(userStats);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  if (!userProfile) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Please sign in to view your profile</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E10600] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-[#1F1F2B] rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-[#2A2A3A] rounded-full flex items-center justify-center text-4xl">
                {userProfile.displayName[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{userProfile.displayName}</h1>
                <p className="text-gray-400">{userProfile.email}</p>
                <div className="mt-2">
                  <span className="text-[#E10600] font-bold">{userProfile.points}</span>
                  <span className="text-gray-400 ml-2">points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Bets" value={stats.totalBets} />
            <StatCard title="Winning Bets" value={stats.winningBets} />
            <StatCard title="Win Rate" value={`${((stats.winningBets / stats.totalBets) * 100).toFixed(1)}%`} />
            <StatCard title="Points Won" value={stats.totalPointsWon} />
            <StatCard title="Points Lost" value={stats.totalPointsLost} />
            <StatCard title="Net Points" value={stats.totalPointsWon - stats.totalPointsLost} />
            <StatCard title="Favorite Category" value={stats.favoriteCategory} />
            <StatCard title="Best Circuit" value={stats.bestCircuit} />
          </div>

          {/* Betting History */}
          <div className="bg-[#1F1F2B] rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Betting History</h2>
            <div className="space-y-4">
              {bettingHistory.map((bet, index) => (
                <div key={index} className="bg-[#2A2A3A] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{bet.prediction.eventName}</h3>
                      <p className="text-gray-400 text-sm">{bet.prediction.raceWeekend}</p>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${bet.result === 'won' ? 'text-green-500' : bet.result === 'lost' ? 'text-red-500' : 'text-[#E10600]'}`}>
                        {bet.result === 'won' ? `+${bet.pointsWon}` : bet.result === 'lost' ? `-${bet.amount}` : bet.amount} points
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(bet.timestamp.seconds * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-400">Selected: </span>
                    <span className="font-medium">
                      {bet.prediction.options[bet.selectedOption].text}
                    </span>
                    <span className="text-sm text-gray-400 ml-2">
                      (Odds: {bet.prediction.options[bet.selectedOption].odds}x)
                    </span>
                  </div>
                </div>
              ))}
              {bettingHistory.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No betting history yet. Start placing bets to see your history here!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-[#1F1F2B] rounded-lg p-4">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
} 