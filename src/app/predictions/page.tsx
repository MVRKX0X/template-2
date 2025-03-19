'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Prediction, placeBet } from '@/lib/firebase/firebaseUtils';
import Navbar from '@/components/Navbar';

export default function PredictionsPage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedBets, setSelectedBets] = useState<{[key: string]: number}>({});
  const [betAmounts, setBetAmounts] = useState<{[key: string]: number}>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Mock predictions data - in production, this would come from Firebase
    setPredictions([
      {
        id: '1',
        eventName: 'Bahrain GP - Race Winner',
        description: 'Who will win the Bahrain Grand Prix?',
        options: [
          { text: 'Max Verstappen', odds: 1.5 },
          { text: 'Lewis Hamilton', odds: 3.0 },
          { text: 'Charles Leclerc', odds: 4.0 },
          { text: 'Sergio Perez', odds: 6.0 }
        ],
        startDate: new Date() as any,
        endDate: new Date(Date.now() + 86400000) as any // 24 hours from now
      },
      {
        id: '2',
        eventName: 'Bahrain GP - Fastest Lap',
        description: 'Who will set the fastest lap in the race?',
        options: [
          { text: 'Max Verstappen', odds: 2.0 },
          { text: 'Lewis Hamilton', odds: 2.5 },
          { text: 'Charles Leclerc', odds: 3.0 },
          { text: 'Sergio Perez', odds: 4.0 }
        ],
        startDate: new Date() as any,
        endDate: new Date(Date.now() + 86400000) as any
      }
    ]);
  }, []);

  const handleOptionSelect = (predictionId: string, optionIndex: number) => {
    setSelectedBets(prev => ({
      ...prev,
      [predictionId]: optionIndex
    }));
  };

  const handleBetAmountChange = (predictionId: string, amount: string) => {
    const numAmount = parseInt(amount) || 0;
    setBetAmounts(prev => ({
      ...prev,
      [predictionId]: numAmount
    }));
  };

  const handlePlaceBet = async (prediction: Prediction) => {
    if (!user) {
      setMessage('Please sign in to place bets');
      return;
    }

    const selectedOption = selectedBets[prediction.id];
    const betAmount = betAmounts[prediction.id] || 0;

    if (selectedOption === undefined) {
      setMessage('Please select an option to bet on');
      return;
    }

    if (betAmount <= 0) {
      setMessage('Please enter a valid bet amount');
      return;
    }

    if (betAmount > (user.points || 0)) {
      setMessage('Insufficient points');
      return;
    }

    try {
      await placeBet({
        uid: user.uid,
        predictionId: prediction.id,
        selectedOption,
        amount: betAmount
      });

      // Reset selection and amount for this prediction
      setSelectedBets(prev => {
        const newBets = { ...prev };
        delete newBets[prediction.id];
        return newBets;
      });
      setBetAmounts(prev => {
        const newAmounts = { ...prev };
        delete newAmounts[prediction.id];
        return newAmounts;
      });

      setMessage('Bet placed successfully!');
    } catch (error) {
      setMessage('Error placing bet. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-[#E10600]">Race Predictions</h1>
        
        {message && (
          <div className="mb-8 p-4 bg-[#2A2A3A] rounded-lg text-center">
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {predictions.map(prediction => (
            <div key={prediction.id} className="bg-[#1F1F2B] rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">{prediction.eventName}</h2>
              <p className="text-gray-400 mb-6">{prediction.description}</p>

              <div className="space-y-4 mb-6">
                {prediction.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(prediction.id, index)}
                    className={`w-full p-4 text-left rounded-lg transition-colors flex justify-between items-center ${
                      selectedBets[prediction.id] === index
                        ? 'bg-[#E10600] text-white'
                        : 'bg-[#2A2A3A] hover:bg-[#3A3A4A]'
                    }`}
                  >
                    <span>{option.text}</span>
                    <span className="text-sm">
                      {option.odds}x
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex space-x-4">
                <input
                  type="number"
                  value={betAmounts[prediction.id] || ''}
                  onChange={(e) => handleBetAmountChange(prediction.id, e.target.value)}
                  placeholder="Bet amount"
                  className="flex-1 p-2 rounded-md bg-[#2A2A3A] text-white"
                  min="1"
                  max={user?.points || 0}
                />
                <button
                  onClick={() => handlePlaceBet(prediction)}
                  className="px-6 py-2 bg-[#E10600] rounded-md hover:bg-[#FF0700] transition-colors"
                >
                  Place Bet
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-400">
                Potential win: {
                  (betAmounts[prediction.id] || 0) * 
                  (selectedBets[prediction.id] !== undefined 
                    ? prediction.options[selectedBets[prediction.id]].odds 
                    : 0)
                } points
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 