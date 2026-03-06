import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import userApi from '../api/userApi';
import { saveUserToLocal } from '../lib/localUser';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

const SignUp = ({ onLogin }) => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(signUpSchema)
  });


  const mutation = useMutation({
    mutationFn: (data) => userApi.create({
      username: data.username,
      name: data.name,
      avatar: ''
    }),
    onSuccess: (response) => {
      const user = response.data.user || response.data;
      saveUserToLocal(user);
      toast.success('Registration successful! Now choose your avatar.');
      if (user.role === 'host') {
        navigate('/');
      } else {
        navigate('/auth/choose-avatar', { state: { user } });
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || 'Registration failed!');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
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
        <Card style={{ 
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
                <img src="/signup.gif" alt="Sign Up" className="mx-auto mb-3 sm:mb-4 h-30 sm:h-auto" />
                <h1 className="text-2xl sm:text-3xl font-bold text-banana-green-dark text-shadow-cute">
                  Come to Play
                </h1>
                <p className="text-banana-green mt-2 text-sm sm:text-base">
                  Create an account to start your journey
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Name Field */}
                <Field>
                  <FieldLabel htmlFor="name" className="text-sm font-semibold text-banana-green-dark">
                    Display Name
                  </FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-banana-green-400 pointer-events-none" size={18} />
                    <Input
                      id="name"
                      type="text"
                      {...register('name')}
                      className={`input-cute w-full ${errors.name ? 'border-red-400' : ''}`}
                      placeholder="Enter your name"
                    />
                  </div>
                  {errors.name && (
                    <FieldDescription className="text-red-500 text-sm">
                      {errors.name.message}
                    </FieldDescription>
                  )}
                </Field>

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
                      placeholder="Choose a username"
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
                  variant="cute-pink"
                  className="w-full text-lg"
                >
                  {mutation.isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    'Join Game'
                  )}
                </Button>
              </div>

              {/* Links */}
              <div className="text-center mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                <FieldDescription className="text-banana-green text-xs sm:text-sm">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-banana-green-600 font-semibold hover:text-banana-green-800 transition-colors"
                  >
                    Sign in now
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

export default SignUp;