import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b border-border">
      <div className="container flex items-center justify-end h-14 px-4 max-w-7xl mx-auto">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <span className="font-bold text-lg tracking-tight">Mr. Jollof</span>
          <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
            <span className="text-background text-sm font-bold">MJ</span>
          </div>
        </div>
      </div>
    </header>
  );
};
