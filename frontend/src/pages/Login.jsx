import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters')
});

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      // Check if user exists by username (simple login without password)
      const response = await fetch(`http://localhost:5000/api/users?username=${data.username}`);
      
      if (!response.ok) {
        throw new Error('User not found');
      }

      const users = await response.json();
      const user = users.find(u => u.username === data.username);
      
      if (!user) {
        throw new Error('User not found. Please sign up first.');
      }
      
      onLogin(user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Login failed!');
    }
  };

  return (
    <div 
      className="h-screen max-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-sm sm:max-w-md px-2 sm:px-0">
        <Card className="overflow-hidden" style={{ 
          background: "rgba(255, 255, 255, 0.6)", 
          backdropFilter: "blur(10px)", 
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        }}>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit(onSubmit)} className="px-4 sm:px-6 py-0">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <img src="/login.gif" alt="Login" className="mx-auto mb-3 sm:mb-4 h-12 sm:h-auto" />
                <h1 className="text-2xl sm:text-3xl font-bold text-banana-green-dark text-shadow-cute">
                  Let's Play Together
                </h1>
                <p className="text-banana-green mt-2 text-sm sm:text-base">
                  Sign in to continue your adventure
                </p>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {/* Username Field */}
                <Field>
                  <FieldLabel htmlFor="username" className="text-sm font-semibold text-banana-green-dark">
                    Username
                  </FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-banana-green-400 pointer-events-none" size={18} />
                    <Input
                      id="username"
                      type="text"
                      {...register('username')}
                      className={`input-cute w-full ${errors.username ? 'border-red-400' : ''}`}
                      placeholder="Enter your username"
                    />
                  </div>
                  {errors.username && (
                    <FieldDescription className="text-red-500 text-sm">
                      {errors.username.message}
                    </FieldDescription>
                  )}
                </Field>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-banana w-full text-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-banana-green-700"></div>
                      <span>Joining game...</span>
                    </div>
                  ) : (
                    'Join Game'
                  )}
                </Button>
              </div>

              {/* Links */}
              <div className="text-center mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                <FieldDescription className="text-banana-green text-xs sm:text-sm">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="text-banana-green-600 font-semibold hover:text-banana-green-800 transition-colors"
                  >
                    Sign up now
                  </Link>
                </FieldDescription>
                <FieldDescription className="text-red-600 text-xs sm:text-sm">
                  <Link 
                    to="/admin-login" 
                    className="text-red-600 font-semibold hover:text-red-800 transition-colors"
                  >
                    🔐 Are you admin?
                  </Link>
                </FieldDescription>
                <Link 
                  to="/" 
                  className="text-banana-green-400 text-xs sm:text-sm hover:text-banana-green-600 transition-colors block"
                >
                  ← Back to home
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;