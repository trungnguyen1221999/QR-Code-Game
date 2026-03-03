import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

const Contact = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Message sent successfully!');
      reset();
    } catch (error) {
      toast.error('Failed to send message!');
    }
  };

  return (
    <div className="min-h-screen bg-banana-gradient py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="animate-bounce-cute mb-6">
            <span className="text-6xl">📞</span>
          </div>
          <h1 className="text-5xl font-bold text-banana-green-dark mb-6 text-shadow-cute">
            Contact Us
          </h1>
          <p className="text-xl text-banana-green max-w-3xl mx-auto">
            Have questions, feedback, or need support? 
            We're always ready to listen and help you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card-cute">
            <div className="flex items-center space-x-3 mb-6">
              <MessageCircle size={24} className="text-banana-green-600" />
              <h2 className="text-2xl font-bold text-banana-green-dark">
                Send Message
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-banana-green-dark mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className={`input-cute w-full ${errors.name ? 'border-red-400' : ''}`}
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-banana-green-dark mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`input-cute w-full ${errors.email ? 'border-red-400' : ''}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-banana-green-dark mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  className={`input-cute w-full ${errors.subject ? 'border-red-400' : ''}`}
                  placeholder="What would you like to talk about..."
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-banana-green-dark mb-2">
                  Message
                </label>
                <textarea
                  {...register('message')}
                  rows={5}
                  className={`input-cute w-full resize-none ${errors.message ? 'border-red-400' : ''}`}
                  placeholder="Share with us..."
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-banana w-full flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-banana-green-700"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Get in Touch */}
            <div className="card-cute">
              <h2 className="text-2xl font-bold text-banana-green-dark mb-6">
                Contact Information
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cute-gradient rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-banana-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banana-green-dark mb-1">Email</h3>
                    <p className="text-banana-green">contact@qrgame.com</p>
                    <p className="text-banana-green">support@qrgame.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sunshine-gradient rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-banana-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banana-green-dark mb-1">Phone</h3>
                    <p className="text-banana-green">+1 234 567 8900</p>
                    <p className="text-banana-green text-sm">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cute-gradient rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-banana-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-banana-green-dark mb-1">Address</h3>
                    <p className="text-banana-green">123 Game Street, Tech District</p>
                    <p className="text-banana-green">San Francisco, CA 94102</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="card-cute">
              <h3 className="text-xl font-bold text-banana-green-dark mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                <div className="glass-banana rounded-cute p-4">
                  <h4 className="font-semibold text-banana-green-dark text-sm mb-1">
                    How do I start playing?
                  </h4>
                  <p className="text-banana-green text-sm">
                    Create a free account and start scanning QR codes right away!
                  </p>
                </div>
                <div className="glass-banana rounded-cute p-4">
                  <h4 className="font-semibold text-banana-green-dark text-sm mb-1">
                    Is the game free?
                  </h4>
                  <p className="text-banana-green text-sm">
                    Completely free with many exciting features.
                  </p>
                </div>
                <div className="glass-banana rounded-cute p-4">
                  <h4 className="font-semibold text-banana-green-dark text-sm mb-1">
                    Is there mobile app support?
                  </h4>
                  <p className="text-banana-green text-sm">
                    Currently we have a responsive web app, mobile app is in development.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="card-cute text-center">
              <h3 className="text-xl font-bold text-banana-green-dark mb-4">
                Kết nối với chúng tôi
              </h3>
              <div className="flex justify-center space-x-4">
                <div className="w-12 h-12 bg-cute-gradient rounded-full flex items-center justify-center hover-wiggle cursor-pointer">
                  <span className="text-xl">📘</span>
                </div>
                <div className="w-12 h-12 bg-cute-gradient rounded-full flex items-center justify-center hover-wiggle cursor-pointer">
                  <span className="text-xl">📷</span>
                </div>
                <div className="w-12 h-12 bg-cute-gradient rounded-full flex items-center justify-center hover-wiggle cursor-pointer">
                  <span className="text-xl">🐦</span>
                </div>
                <div className="w-12 h-12 bg-cute-gradient rounded-full flex items-center justify-center hover-wiggle cursor-pointer">
                  <span className="text-xl">📺</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;