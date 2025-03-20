import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to NXTBET F1
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            The ultimate platform for F1 race predictions and quizzes. Test your knowledge and compete with other fans!
          </p>
        </div>
      </div>
    </div>
  );
}
