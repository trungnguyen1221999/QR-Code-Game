import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/ui/PageLayout';
import Button from '../components/ui/Button';
import { uploadAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext.jsx';
import { translate } from '../translations/index';

const DEFAULT_AVATARS = [
  '/avatar/avatar1.png',
  '/avatar/avatar2.png',
  '/avatar/avatar3.png',
  '/avatar/avatar4.png',
];

export default function AvatarSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const current = location.state?.current || DEFAULT_AVATARS[0];

  const [selected, setSelected] = useState(current);
  const [customAvatars, setCustomAvatars] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const allAvatars = [...DEFAULT_AVATARS, ...customAvatars];

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const data = await uploadAPI.avatar(file);
      setCustomAvatars(prev => [...prev, data.url]);
      setSelected(data.url);
    } catch (err) {
      toast.error(translate(t.uploadFailed, { message: err.message }));
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = () => {
    navigate('/join', { state: { avatar: selected } });
  };

  return (
    <PageLayout back={-1}>
      <div className="pt-4 pb-8 flex flex-col gap-6">

        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{t.chooseYourAvatar}</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
            {t.pickOrUploadAvatar}
          </p>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <img
            src={selected}
            alt={t.selectedAvatarAlt}
            className="rounded-full object-cover"
            style={{ width: 100, height: 100, border: '4px solid var(--color-primary)' }}
          />
        </div>

        {/* Avatar grid */}
        <div className="grid grid-cols-4 gap-4">
          {allAvatars.map((src) => {
            const isSelected = selected === src;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setSelected(src)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="rounded-full overflow-hidden transition-transform active:scale-95"
                  style={{
                    width: 64,
                    height: 64,
                    border: isSelected ? '3px solid var(--color-primary)' : '3px solid var(--color-border)',
                    boxShadow: isSelected ? '0 0 0 2px var(--color-primary)' : 'none',
                  }}
                >
                  <img src={src} alt={t.avatarAlt} className="w-full h-full object-cover" />
                </div>
                {isSelected && (
                  <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>✓</span>
                )}
              </button>
            );
          })}

          {/* Upload tile */}
          <button
            type="button"
            onClick={() => !uploading && fileInputRef.current.click()}
            className="flex flex-col items-center gap-1"
            disabled={uploading}
          >
            <div
              className="rounded-full flex items-center justify-center transition-transform active:scale-95"
              style={{
                width: 64,
                height: 64,
                border: '2px dashed var(--color-primary)',
                backgroundColor: 'var(--color-info-bg)',
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {uploading
                ? <Loader size={22} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
                : <Upload size={22} style={{ color: 'var(--color-primary)' }} />
              }
            </div>
            <span className="text-xs" style={{ color: 'var(--color-subtext)' }}>
              {uploading ? t.uploading : t.upload}
            </span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

        <Button type="button" onClick={handleSelect}>
          {t.select}
        </Button>

      </div>
    </PageLayout>
  );
}