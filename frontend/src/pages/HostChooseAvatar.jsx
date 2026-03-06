import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Upload, Camera, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { predefinedAvatars } from '@/data/avatarData';
import hostApi from '../api/hostApi';
import { getHostFromLocal, saveHostToLocal } from '../lib/localHost';

const HostChooseAvatar = () => {
  const navigate = useNavigate();
  const host = getHostFromLocal();

  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setUploadedAvatar(file);
      setUploadedAvatarUrl(URL.createObjectURL(file));
      setSelectedAvatar('');
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
      let updatedHost;
      if (uploadedAvatar) {
        const res = await hostApi.uploadAvatar(host._id, uploadedAvatar);
        updatedHost = { ...host, avatar: res.data.avatarUrl };
      } else if (selectedAvatar) {
        const res = await hostApi.update(host._id, { avatar: selectedAvatar.path });
        updatedHost = res.data.host || res.data;
      }
      saveHostToLocal(updatedHost);
      toast.success('Avatar saved successfully!');
      navigate('/host-dashboard');
    } catch (error) {
      toast.error('Failed to save avatar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!host) {
    navigate('/host-login');
    return null;
  }

  return (
    <div className="min-h-screen bg-banana-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(15px)", border: "2px solid rgba(255, 255, 255, 0.3)", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}>
          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-green-700 text-shadow-cute mb-2 flex items-center justify-center gap-2">
                Host <span className="text-2xl">👑</span> Avatar
              </h1>
              <p className="text-gray-700 mt-2">Choose your host avatar</p>
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              {predefinedAvatars.map((avatar) => (
                <button
                  key={avatar.path}
                  type="button"
                  className={`rounded-full border-2 p-1 ${selectedAvatar === avatar ? 'border-green-500' : 'border-gray-300'}`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <img src={avatar.path} alt={avatar.name} className="w-16 h-16 object-cover rounded-full" />
                </button>
              ))}
            </div>
            <div className="mb-6">
              <label className="block mb-2 font-semibold">Upload Custom Avatar</label>
              <input type="file" accept="image/*" onChange={handleFileUpload} />
              {uploadedAvatarUrl && (
                <img src={uploadedAvatarUrl} alt="Uploaded Avatar" className="w-16 h-16 rounded-full mt-2" />
              )}
            </div>
            <Button variant="banana" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Avatar'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostChooseAvatar;
