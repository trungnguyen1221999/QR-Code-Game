import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Upload, Camera, Check, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { predefinedAvatars } from '@/data/avatarData';

const ChooseAvatar = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user; // User data from signup
  
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        avatar: avatar.path || avatar // Handle both object and string avatars
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
              <h1 className="text-3xl font-bold text-banana-green-dark text-shadow-cute mb-2">
                Choose Your Avatar
              </h1>
              <p className="text-banana-green text-lg">
                Pick an avatar that represents you, {user.name}!
              </p>
            </div>

            {/* Current Selection Preview */}
            <div className="text-center mb-8">
              <div 
                className="w-35 h-35 mx-auto mb-4 bg-cute-gradient rounded-full flex items-center justify-center text-4xl border-4 overflow-hidden"
                style={{
                  borderColor: selectedAvatar?.borderColor || '#22c55e' // Default green or avatar color
                }}
              >
                {uploadedAvatarUrl ? (
                  <img 
                    src={uploadedAvatarUrl} 
                    alt="Uploaded avatar"
                    className="w-full h-full object-cover"
                  />
                ) : selectedAvatar ? (
                  <img 
                    src={selectedAvatar.path || selectedAvatar} 
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
                {predefinedAvatars.map((avatar) => (
                  <div key={avatar.id} className="text-center relative">
                    <button
                      onClick={() => handleAvatarSelect(avatar)}
                      className={`relative w-20 h-20 rounded-full transition-all duration-300 hover:scale-110 hover-wiggle overflow-hidden mb-2 ${
                        selectedAvatar?.id === avatar.id 
                          ? 'border-4 shadow-cute-lg scale-110' 
                          : 'border-2 border-transparent hover:border-banana-green-300'
                      }`}
                      style={{
                        borderColor: selectedAvatar?.id === avatar.id ? avatar.borderColor : 'transparent',
                        backgroundColor: selectedAvatar?.id === avatar.id ? avatar.bgColor : '#f9a8d4'
                      }}
                    >
                      <img 
                        src={avatar.path} 
                        alt={avatar.name} 
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          // Fallback to a default emoji if image fails to load
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '👤';
                        }}
                      />
                      
                      {selectedAvatar?.id === avatar.id && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2" style={{ borderColor: avatar.borderColor }}>
                          <Check size={12} style={{ color: avatar.color }} />
                        </div>
                      )}
                    </button>
                    
                    {/* Speech bubble for selected avatar */}
                    {selectedAvatar?.id === avatar.id && selectedAvatar.catchphrase && (
                      <div 
                        className="absolute -top-4 transform -translate-x-1/2 z-10"
                        style={{
                          left: avatar.id % 2 === 1 ? '75%' : '25%' // Odd: right, Even: left
                        }}
                      >
                        <div 
                          className="bg-white px-3 py-2 rounded-xl shadow-lg relative border-2 min-w-max"
                          style={{ 
                            borderColor: selectedAvatar.color,
                            backgroundColor: selectedAvatar.bgColor 
                          }}
                        >
                          <p className="text-xs font-bold text-center" style={{ color: selectedAvatar.color }}>
                            {selectedAvatar.catchphrase}
                          </p>
                          {/* Speech bubble arrow pointing down */}
                          <div 
                            className="absolute top-full w-0 h-0"
                            style={{
                              left: avatar.id % 2 === 1 ? '25%' : '75%', // Opposite of bubble position
                              borderLeft: '6px solid transparent',
                              borderRight: '6px solid transparent',
                              borderTop: `6px solid ${selectedAvatar.color}`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
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
                  variant="banana"
                  className="min-w-32"
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