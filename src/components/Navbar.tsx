'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Navbar() {
  const { user, signIn, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-red-600">NXTBET F1</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.displayName}</span>
                <button
                  onClick={signOut}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
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