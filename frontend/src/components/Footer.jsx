import { Link } from 'react-router-dom';
import { Heart, Github, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer 
      className="border-t-2 border-white border-opacity-30 mt-auto" 
      style={{
        backgroundImage: "url(/footer.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backdropFilter: "blur(10px)", 
        boxShadow: "0 -8px 32px 0 rgba(31, 38, 135, 0.37)"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <div className="w-8 h-8 bg-cute-gradient rounded-cute flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <h3 className="text-2xl font-black text-black" style={{ fontFamily: "'Comic Neue', cursive", textShadow: "2px 2px 4px rgba(0,0,0,0.2)" }}>QR Game</h3>
            </div>
            <p className="text-black font-bold text-base" style={{ fontFamily: "'Comic Neue', cursive" }}>
              Fun and educational QR game for all ages. 
              Explore, learn and have fun with us!
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="font-black text-black text-xl mb-4" style={{ fontFamily: "'Comic Neue', cursive", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-black font-bold text-lg hover:text-gray-800 transition-colors duration-300"
                  style={{ fontFamily: "'Comic Neue', cursive" }}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-black font-bold text-lg hover:text-gray-800 transition-colors duration-300"
                  style={{ fontFamily: "'Comic Neue', cursive" }}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/ranking" 
                  className="text-black font-bold text-lg hover:text-gray-800 transition-colors duration-300"
                  style={{ fontFamily: "'Comic Neue', cursive" }}
                >
                  Ranking
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <h4 className="font-black text-black text-xl mb-4" style={{ fontFamily: "'Comic Neue', cursive", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>Connect with us</h4>
            <div className="flex justify-center md:justify-end space-x-4 mb-4">
              <a 
                href="mailto:contact@qrgame.com" 
                className="p-2 bg-cute-pink rounded-full hover:bg-cute-pink-400 hover:text-white transition-all duration-300 hover-wiggle"
              >
                <Mail size={20} />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-cute-pink rounded-full hover:bg-cute-pink-400 hover:text-white transition-all duration-300 hover-wiggle"
              >
                <Github size={20} />
              </a>
            </div>
            <p className="text-base text-black font-bold" style={{ fontFamily: "'Comic Neue', cursive" }}>
              Email: contact@qrgame.com
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-black border-opacity-20 mt-8 pt-6 text-center">
          <p className="text-black font-bold text-base flex items-center justify-center space-x-1" style={{ fontFamily: "'Comic Neue', cursive" }}>
            <span>© 2026 QR Game. Made with</span>
            <Heart size={16} className="text-cute-pink-400 animate-bounce-cute" />
            <span>by QR Team</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;