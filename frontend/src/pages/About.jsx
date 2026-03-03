import { Target, Users, Award, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-banana-gradient py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="animate-bounce-cute mb-6">
            <span className="text-6xl">🎯</span>
          </div>
          <h1 className="text-5xl font-bold text-banana-green-dark mb-6 text-shadow-cute">
            About QR Game
          </h1>
          <p className="text-xl text-banana-green max-w-3xl mx-auto">
            We created QR Game with the desire to bring unique and 
            exciting gaming experiences to everyone.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="card-cute">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-cute-gradient rounded-full flex items-center justify-center">
                <Target size={24} className="text-banana-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-banana-green-dark">Mission</h2>
            </div>
            <p className="text-banana-green text-lg leading-relaxed">
              We believe that learning and entertainment can be perfectly combined. 
              QR Game was born to create a bridge between modern technology and 
              real-world interactive experiences, helping people explore the world 
              around them in a fun and creative way.
            </p>
          </div>

          <div className="card-cute">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-sunshine-gradient rounded-full flex items-center justify-center">
                <Heart size={24} className="text-banana-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-banana-green-dark">Vision</h2>
            </div>
            <p className="text-banana-green text-lg leading-relaxed">
              Become the leading QR Code gaming platform where people can 
              connect, learn and play together. We aim to build a global 
              community with meaningful gaming experiences.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-banana-green-dark mb-12">
            What Makes Us Special?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-cute text-center hover-wiggle">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-banana-green-dark mb-3">
                Advanced QR Technology
              </h3>
              <p className="text-banana-green">
                Using the latest QR Code technology to create smooth 
                and accurate experiences.
              </p>
            </div>

            <div className="card-cute text-center hover-wiggle">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-banana-green-dark mb-3">
                Unique Gameplay
              </h3>
              <p className="text-banana-green">
                Creative game mechanics design, combining the real world 
                and virtual world.
              </p>
            </div>

            <div className="card-cute text-center hover-wiggle">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-bold text-banana-green-dark mb-3">
                Friendly Community
              </h3>
              <p className="text-banana-green">
                Safe, positive gaming environment that encourages 
                creativity.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="card-cute text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-cute-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users size={40} className="text-banana-green-600" />
            </div>
            <h2 className="text-4xl font-bold text-banana-green-dark mb-4">
              Development Team
            </h2>
            <p className="text-xl text-banana-green max-w-2xl mx-auto">
              We are a small team of technology and gaming enthusiasts, 
              always striving to bring the best experiences to players.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="glass-banana rounded-cute p-4">
              <div className="text-3xl mb-2">👨‍💻</div>
              <div className="font-semibold text-banana-green-dark">Developers</div>
              <div className="text-sm text-banana-green">Passionate coders</div>
            </div>
            <div className="glass-banana rounded-cute p-4">
              <div className="text-3xl mb-2">🎨</div>
              <div className="font-semibold text-banana-green-dark">Designers</div>
              <div className="text-sm text-banana-green">Creative minds</div>
            </div>
            <div className="glass-banana rounded-cute p-4">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold text-banana-green-dark">Game Masters</div>
              <div className="text-sm text-banana-green">Experience crafters</div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-16 text-center">
          <h2 className="text-4xl font-bold text-banana-green-dark mb-8">
            Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-banana rounded-cute p-6">
              <div className="text-3xl mb-3">🔥</div>
              <h3 className="font-bold text-banana-green-dark mb-2">Passion</h3>
              <p className="text-sm text-banana-green">Love in everything we do</p>
            </div>
            <div className="glass-banana rounded-cute p-6">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-bold text-banana-green-dark mb-2">Innovation</h3>
              <p className="text-sm text-banana-green">Always seeking new solutions</p>
            </div>
            <div className="glass-banana rounded-cute p-6">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-bold text-banana-green-dark mb-2">Collaboration</h3>
              <p className="text-sm text-banana-green">Building strong communities</p>
            </div>
            <div className="glass-banana rounded-cute p-6">
              <div className="text-3xl mb-3">💯</div>
              <h3 className="font-bold text-banana-green-dark mb-2">Quality</h3>
              <p className="text-sm text-banana-green">Committed to best experiences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;