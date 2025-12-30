import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { SettingsPanel } from '@/components/SettingsPanel';
import { CategoryDialog } from '@/components/CategoryDialog';
import { MobileNav } from '@/components/MobileNav';
import { EmptyState } from '@/components/EmptyState';
import { Sparkles, Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { categories, searchQuery, loading: appLoading, seedDefaultCategories } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [hasSeeded, setHasSeeded] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Seed default categories for new users
  useEffect(() => {
    if (user && !appLoading && categories.length === 0 && !hasSeeded) {
      setHasSeeded(true);
      seedDefaultCategories();
    }
  }, [user, appLoading, categories.length, hasSeeded, seedDefaultCategories]);

  const filteredCategories = categories
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter(category => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        category.name.toLowerCase().includes(query) ||
        category.tools.some(tool =>
          tool.name.toLowerCase().includes(query) ||
          tool.description?.toLowerCase().includes(query) ||
          tool.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      );
    });

  // Show loading while checking auth or loading data
  if (authLoading || (user && appLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-glow pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-primary blur-xl opacity-50" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading your workspace...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-glow pointer-events-none" />
      
      <Header 
        onAddCategory={() => setAddCategoryOpen(true)} 
        onOpenSettings={() => setSettingsOpen(true)} 
      />

      <main className="container mx-auto px-4 py-8 pb-32 md:pb-8">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Personal AI Command Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome to <span className="text-gradient">INTELYX</span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Your intelligence, unified. Access all your AI tools and productivity platforms from one beautiful dashboard.
          </p>
        </motion.div>

        {/* Categories */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CategorySection category={category} searchQuery={searchQuery} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : searchQuery ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground text-lg">
              No tools found for "{searchQuery}"
            </p>
            <p className="text-muted-foreground/70 text-sm mt-2">
              Try a different search term
            </p>
          </motion.div>
        ) : (
          <EmptyState onAddCategory={() => setAddCategoryOpen(true)} />
        )}
      </main>

      {/* Mobile Navigation */}
      <MobileNav 
        onAddCategory={() => setAddCategoryOpen(true)} 
        onOpenSettings={() => setSettingsOpen(true)} 
      />

      {/* Dialogs */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
      <CategoryDialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen} />
    </div>
  );
};

export default Index;
