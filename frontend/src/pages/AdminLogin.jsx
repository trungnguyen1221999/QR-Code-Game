import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

const AdminLogin = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: 'admin',
      password: 'admin'
    }
  });

  const onSubmit = async (data) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check admin credentials
      if (data.username === 'admin' && data.password === 'admin') {
        const userData = {
          id: 'admin',
          name: 'Administrator',
          username: data.username,
          avatar: '👑',
          role: 'admin'
        };
        
        onLogin(userData);
        toast.success('Admin login successful!');
        navigate('/admin'); // Navigate to admin dashboard
      } else {
        toast.error('Invalid admin credentials!');
      }
    } catch (error) {
      toast.error('Admin login failed!');
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
      <div className="w-full max-w-md">
        <Card className="overflow-hidden" style={{ 
          background: "rgba(255, 255, 255, 0.6)", 
          backdropFilter: "blur(10px)", 
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        }}>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {/* Header */}
              <div className="text-center mb-8">
                <img src="/admin.png" alt="Admin" className="mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-red-700 text-shadow-cute">
                  Admin Access
                </h1>
                <p className="text-gray-700 mt-2">
                  Restricted area - Administrators only
                </p>
              </div>

              <div className="space-y-6">
                {/* Username Field */}
                <Field>
                  <FieldLabel htmlFor="username" className="text-sm font-semibold text-gray-700">
                    Admin Username
                  </FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                    <Input
                      id="username"
                      type="text"
                      {...register('username')}
                      className={`input-cute w-full ${errors.username ? 'border-red-400' : ''}`}
                      placeholder="Enter admin username"
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
                  <FieldLabel htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Admin Password
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register('password')}
                      className={`input-cute w-full pr-12 ${errors.password ? 'border-red-400' : ''}`}
                      placeholder="Enter admin password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
                  className="bg-red-600 hover:bg-red-700 text-white w-full text-lg py-3 rounded-lg font-semibold"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <Shield className="mr-2" size={18} />
                      Admin Sign In
                    </>
                  )}
                </Button>
              </div>

              {/* Links */}
              <div className="text-center mt-6 space-y-3">
                <FieldDescription className="text-gray-600 text-sm">
                  Default credentials: admin / admin
                </FieldDescription>
                <Link 
                  to="/login" 
                  className="text-blue-600 text-sm hover:text-blue-800 transition-colors block"
                >
                  ← Back to user login
                </Link>
                <Link 
                  to="/" 
                  className="text-gray-500 text-sm hover:text-gray-700 transition-colors block"
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

export default AdminLogin;