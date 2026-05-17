import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '13px',
              borderRadius: '8px',
              padding: '10px 14px',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
