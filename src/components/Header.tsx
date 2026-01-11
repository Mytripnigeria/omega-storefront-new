import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b border-border">
      <div className="container flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="Mr. Jollof" className="h-10 w-auto" />
        </div>
      </div>
    </header>
  );
};
