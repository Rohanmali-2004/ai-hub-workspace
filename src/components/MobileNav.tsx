import { useState } from 'react';
import { Home, FolderPlus, Settings, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileNavProps {
  onAddCategory: () => void;
  onOpenSettings: () => void;
}

export const MobileNav = ({ onAddCategory, onOpenSettings }: MobileNavProps) => {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', action: () => setActiveTab('home') },
    { id: 'add', icon: FolderPlus, label: 'Add', action: onAddCategory },
    { id: 'settings', icon: Settings, label: 'Settings', action: onOpenSettings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-border/50 px-6 py-2 safe-area-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={tab.action}
              className="relative flex flex-col items-center gap-1 p-2 min-w-[60px]"
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
              <tab.icon 
                className={`w-5 h-5 relative z-10 transition-colors ${
                  activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
                }`} 
              />
              <span 
                className={`text-xs relative z-10 transition-colors ${
                  activeTab === tab.id ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
