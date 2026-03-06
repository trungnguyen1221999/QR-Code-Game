import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getUserFromLocal } from '../lib/localUser';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { useMutation } from '@tanstack/react-query';
import userApi from '../api/userApi';
import { saveUserToLocal } from '../lib/localUser';



const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters')
});

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const localUser = getUserFromLocal();
    if (localUser) {
      onLogin(localUser);
      if (localUser.role === 'host') {
        navigate('/');
      } else {
        localUser.isInWaitingRoom = true;
        saveUserToLocal(localUser);
        userApi.joinWaitingRoom(localUser._id).catch(() => {});
        navigate('/waiting-room');
      }
    }
  }, []); // Only run once on mount

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });


  const mutation = useMutation({
    mutationFn: ({ username }) => userApi.login(username),
    onSuccess: async (response) => {
      const user = response.data.user || response.data;
      saveUserToLocal(user);
      onLogin(user);
      toast.success('Welcome back!');
      if (user.role === 'host') {
        navigate('/');
      } else {
        user.isInWaitingRoom = true;
        saveUserToLocal(user);
        await userApi.joinWaitingRoom(user._id);
        navigate('/waiting-room');
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || 'Login failed!');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate({ username: data.username });
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
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          paddingTop: "10px",
          paddingBottom: "10px"
        }}>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit(onSubmit)} className="px-4 sm:px-6 py-0">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <img src="/login.gif" alt="Login" className="mx-auto mb-3 sm:mb-4 h-25 sm:h-auto" />
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
                  disabled={mutation.isLoading}
                  variant="banana"
                  className="w-full text-lg"
                >
                  {mutation.isLoading ? (
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
                    to="/host-login" 
                    className="text-red-600 font-semibold hover:text-red-800 transition-colors"
                  >
                    🔐 Are you host?
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