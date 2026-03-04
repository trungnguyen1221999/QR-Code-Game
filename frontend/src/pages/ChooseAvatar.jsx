import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Upload, Camera, Check, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ChooseAvatar = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user; // User data from signup
  
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined avatars (using avatar files from public/avatar/)
  const predefinedAvatars = [
    '/avatar/avatar1.png',
    '/avatar/avatar2.png', 
    '/avatar/avatar3.png',
    '/avatar/avatar4.png',
    // You can add more avatar files here
  ];

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setUploadedAvatar(file);
      setUploadedAvatarUrl(URL.createObjectURL(file));
      setSelectedAvatar(''); // Clear predefined selection
    }
  };

  // Handle predefined avatar selection
  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setUploadedAvatar(null);
    setUploadedAvatarUrl('');
  };

  // Submit avatar choice
  const handleSubmit = async () => {
    if (!selectedAvatar && !uploadedAvatar) {
      toast.error('Please choose an avatar');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let avatarToSave = selectedAvatar;
      
      // If user uploaded a file, convert to base64 for simplicity
      if (uploadedAvatar) {
        const reader = new FileReader();
        reader.onload = async () => {
          avatarToSave = reader.result; // base64 string
          await updateUserAvatar(avatarToSave);
        };
        reader.readAsDataURL(uploadedAvatar);
        return;
      }
      
      await updateUserAvatar(avatarToSave);
    } catch (error) {
      toast.error('Failed to save avatar');
      setIsSubmitting(false);
    }
  };

  // Update user avatar in backend
  const updateUserAvatar = async (avatar) => {
    try {
      // Temporary: Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create updated user object
      const updatedUser = {
        ...user,
        avatar: avatar
      };
      
      // Login with updated user data
      onLogin(updatedUser);
      toast.success('Avatar saved successfully!');
      navigate('/');

      /* TODO: Replace with real API call when backend is ready
      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar: avatar
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      const updatedUser = await response.json();
      
      // Login with updated user data
      onLogin(updatedUser.user);
      toast.success('Avatar saved successfully!');
      navigate('/');
      */
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip avatar selection
  const handleSkip = async () => {
    try {
      onLogin(user);
      toast.success('Welcome to QR Game!');
      navigate('/');
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  if (!user) {
    // If no user data, redirect to signup
    navigate('/auth/signup');
    return null;
  }

  return (
    <div 
      className="min-h-screen bg-banana-gradient flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden" style={{ 
          background: "rgba(255, 255, 255, 0.9)", 
          backdropFilter: "blur(15px)", 
          border: "2px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        }}>
          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="animate-bounce-cute mb-4">
                <span className="text-6xl">🎭</span>
              </div>
              <h1 className="text-3xl font-bold text-banana-green-dark text-shadow-cute mb-2">
                Choose Your Avatar
              </h1>
              <p className="text-banana-green text-lg">
                Pick an avatar that represents you, {user.name}!
              </p>
            </div>

            {/* Current Selection Preview */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4 bg-cute-gradient rounded-full flex items-center justify-center text-4xl border-4 border-banana-green-300 overflow-hidden">
                {uploadedAvatarUrl ? (
                  <img 
                    src={uploadedAvatarUrl} 
                    alt="Uploaded avatar"
                    className="w-full h-full object-cover"
                  />
                ) : selectedAvatar ? (
                  <img 
                    src={selectedAvatar} 
                    alt="Selected avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  '👤'
                )}
              </div>
              <p className="text-sm text-banana-green">
                {selectedAvatar || uploadedAvatar ? 'Your chosen avatar' : 'No avatar selected'}
              </p>
            </div>

            {/* Predefined Avatars */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-banana-green-dark mb-4 flex items-center">
                <span className="mr-2">🎨</span>
                Choose from Gallery
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {predefinedAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`relative w-20 h-20 rounded-full transition-all duration-300 hover:scale-110 hover-wiggle overflow-hidden ${
                      selectedAvatar === avatar 
                        ? 'bg-banana-green-300 border-4 border-banana-green-600 shadow-cute-lg scale-110' 
                        : 'bg-cute-pink hover:bg-cute-pink-400 border-2 border-transparent hover:border-banana-green-300'
                    }`}
                  >
                    <img 
                      src={avatar} 
                      alt="Avatar option" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to a default emoji if image fails to load
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '👤';
                      }}
                    />
                    
                    {selectedAvatar === avatar && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-banana-green-600">
                        <Check size={12} className="text-banana-green-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Avatar */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-banana-green-dark mb-4 flex items-center">
                <span className="mr-2">📸</span>
                Or Upload Your Own
              </h3>
              <div className="border-2 border-dashed border-banana-green-300 rounded-cute-lg p-6 text-center bg-banana-green-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label 
                  htmlFor="avatar-upload" 
                  className="cursor-pointer block hover:bg-banana-green-100 rounded-cute p-4 transition-all"
                >
                  <div className="flex flex-col items-center">
                    <Upload size={32} className="text-banana-green-600 mb-2" />
                    <p className="text-banana-green-600 font-semibold">Click to upload image</p>
                    <p className="text-sm text-banana-green text-opacity-70">PNG, JPG up to 5MB</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="text-banana-green-600 hover:text-banana-green-800 flex items-center space-x-2"
              >
                <ArrowLeft size={18} />
                <span>Skip for now</span>
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/auth/signup')}
                  variant="outline"
                  className="border-banana-green-300 text-banana-green-700"
                >
                  Back to signup
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (!selectedAvatar && !uploadedAvatar)}
                  className="btn-banana min-w-32"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-banana-green-700"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Check size={18} className="mr-2" />
                      Continue
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChooseAvatar;