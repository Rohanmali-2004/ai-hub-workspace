import { Settings, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from './SearchBar';
import { motion } from 'framer-motion';

interface HeaderProps {
  onAddCategory: () => void;
  onOpenSettings: () => void;
}

export const Header = ({ onAddCategory, onOpenSettings }: HeaderProps) => {
  return (
    <motion.header 
      className="sticky top-0 z-40 glass border-b border-border/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-primary blur-xl opacity-50" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gradient">INTELYX</h1>
              <p className="text-xs text-muted-foreground">Your intelligence, unified</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddCategory}
              className="hidden md:flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-4 md:hidden">
          <SearchBar />
        </div>
      </div>
    </motion.header>
  );
};
