import React from 'react';
import { Home, Settings as SettingsIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-primary" />
            <div className="text-2xl font-bold text-foreground">
              AI<span className="text-primary">Feast</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant={currentPage === 'main' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('main')}
              size="sm"
            >
              <Home className="w-5 h-5" />
              <span> &nbsp; Compare</span>
            </Button>
            
            <Button
              variant={currentPage === 'settings' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('settings')}
              size="sm"
            >
              <SettingsIcon className="w-5 h-5" />
              <span>&nbsp;Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};