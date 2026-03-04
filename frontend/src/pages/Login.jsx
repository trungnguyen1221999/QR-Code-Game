import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Login = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login
      const userData = {
        id: 1,
        name: 'Player',
        username: data.username,
        avatar: '🎮'
      };
      
      onLogin(userData);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error('Login failed!');
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

                {/* Password Field */}
                <Field>
                  <FieldLabel htmlFor="password" className="text-sm font-semibold text-banana-green-dark">
                    Password
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-banana-green-400 pointer-events-none" size={18} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register('password')}
                      className={`input-cute w-full pr-12 ${errors.password ? 'border-red-400' : ''}`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-banana-green-400 hover:text-banana-green-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <FieldDescription className="text-red-500 text-sm">
                      {errors.password.message}
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
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
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