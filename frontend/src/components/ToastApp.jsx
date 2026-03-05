import { Toaster } from 'react-hot-toast';

export default function ToastApp() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          color: '#166534',
          border: '3px solid #86efac',
          borderRadius: '25px',
          fontWeight: '600',
          fontSize: '14px',
          fontFamily: "'Comic Neue', cursive",
          padding: '16px 20px',
          boxShadow: '0 10px 25px rgba(34, 197, 94, 0.25), 0 4px 12px rgba(34, 197, 94, 0.15)',
          backdropFilter: 'blur(10px)',
          minHeight: '65px',
          minWidth: '320px',
          maxWidth: '90vw',
          width: 'auto',
          transform: 'translateY(0)',
          transition: 'all 0.3s ease',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: 'white',
          },
          style: {
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            border: '3px solid #22c55e',
            animation: 'bounce-in 0.6s ease-out',
            minWidth: '320px',
            maxWidth: '90vw',
          },
        },
        error: {
          iconTheme: {
            primary: '#f472b6',
            secondary: 'white',
          },
          style: {
            background: 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%)',
            border: '3px solid #f472b6',
            color: '#be185d',
            animation: 'shake 0.5s ease-in-out',
            minWidth: '320px',
            maxWidth: '90vw',
          },
        },
        loading: {
          iconTheme: {
            primary: '#fbbf24',
            secondary: 'white',
          },
          style: {
            background: 'linear-gradient(135deg, #fef3c7 0%, #dcfce7 100%)',
            border: '3px solid #fbbf24',
            color: '#92400e',
            animation: 'bounce-in 0.6s ease-out',
            minWidth: '320px',
            maxWidth: '90vw',
          },
        },
      }}
      containerStyle={{
        top: 'auto',
        bottom: '20px',
        right: '20px',
        left: 'auto',
      }}
    />
  );
}
