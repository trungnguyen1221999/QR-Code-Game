import { Link } from 'react-router-dom';
import { Play as PlayIcon, Trophy, Users, Zap } from 'lucide-react';

const Play = ({ isLoggedIn, user }) => {
  return (
    <div className="min-h-screen bg-banana-gradient">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="animate-bounce-cute">
            <span className="text-8xl mb-6 block">🎯</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-banana-green-dark mb-6 text-shadow-cute">
            QR Code Game
          </h1>
          <p className="text-xl md:text-2xl text-banana-green mb-8 max-w-2xl mx-auto">
            Discover the exciting world of QR Code gaming! 
            Scan codes, solve puzzles and conquer challenges with friends.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isLoggedIn ? (
              <button className="btn-banana text-xl px-8 py-4 flex items-center space-x-3">
                <PlayIcon size={24} />
                <span>Start Playing</span>
              </button>
            ) : (
              <>
                <Link to="/signup" className="btn-banana text-xl px-8 py-4 flex items-center space-x-3">
                  <PlayIcon size={24} />
                  <span>Start Playing</span>
                </Link>
                <Link to="/login" className="btn-cute-pink text-xl px-8 py-4">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-banana-green-dark mb-12">
            Why Choose QR Game?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-cute text-center hover-wiggle">
              <div className="w-16 h-16 bg-cute-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                <Zap size={32} className="text-banana-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-banana-green-dark mb-4">
                Fun & Engaging
              </h3>
              <p className="text-banana-green">
                Unique gaming experience with QR Code technology. 
                Every code is a new adventure waiting for you!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-cute text-center hover-wiggle">
              <div className="w-16 h-16 bg-sunshine-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users size={32} className="text-banana-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-banana-green-dark mb-4">
                Play with Friends
              </h3>
              <p className="text-banana-green">
                Connect with friends, create teams and conquer 
                exciting challenges together.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-cute text-center hover-wiggle">
              <div className="w-16 h-16 bg-cute-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                <Trophy size={32} className="text-banana-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-banana-green-dark mb-4">
                Compete & Achieve
              </h3>
              <p className="text-banana-green">
                Real-time leaderboards, achievement badges and 
                exciting rewards are waiting for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-cute-gradient">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="glass-banana rounded-cute-lg p-6">
              <div className="text-3xl font-bold text-banana-green-dark mb-2">1,234</div>
              <div className="text-banana-green">Players</div>
            </div>
            <div className="glass-banana rounded-cute-lg p-6">
              <div className="text-3xl font-bold text-banana-green-dark mb-2">5,678</div>
              <div className="text-banana-green">QR Codes</div>
            </div>
            <div className="glass-banana rounded-cute-lg p-6">
              <div className="text-3xl font-bold text-banana-green-dark mb-2">9,012</div>
              <div className="text-banana-green">Challenges</div>
            </div>
            <div className="glass-banana rounded-cute-lg p-6">
              <div className="text-3xl font-bold text-banana-green-dark mb-2">3,456</div>
              <div className="text-banana-green">Rewards</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 bg-sunshine-gradient">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-banana-green-dark mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-banana-green mb-8 max-w-2xl mx-auto">
              Join the QR Game community today and discover 
              amazing gaming experiences!
            </p>
            <Link to="/signup" className="btn-banana text-xl px-8 py-4 inline-flex items-center space-x-3">
              <span>Sign Up Free</span>
              <PlayIcon size={24} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Play;