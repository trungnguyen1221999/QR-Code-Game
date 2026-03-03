import { Link } from 'react-router-dom';
import { Heart, Github, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-banana-gradient border-t-2 border-banana-green mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <div className="w-8 h-8 bg-cute-gradient rounded-cute flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-banana-green-dark">QR Game</h3>
            </div>
            <p className="text-banana-green text-sm">
              Fun and educational QR game for all ages. 
              Explore, learn and have fun with us!
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="font-semibold text-banana-green-dark mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-banana-green hover:text-banana-green-dark transition-colors duration-300"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-banana-green hover:text-banana-green-dark transition-colors duration-300"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/ranking" 
                  className="text-banana-green hover:text-banana-green-dark transition-colors duration-300"
                >
                  Ranking
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold text-banana-green-dark mb-4">Connect with us</h4>
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
            <p className="text-sm text-banana-green">
              Email: contact@qrgame.com
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-banana-green-200 mt-8 pt-6 text-center">
          <p className="text-banana-green text-sm flex items-center justify-center space-x-1">
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