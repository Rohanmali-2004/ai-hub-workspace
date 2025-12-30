import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { SettingsPanel } from '@/components/SettingsPanel';
import { CategoryDialog } from '@/components/CategoryDialog';
import { MobileNav } from '@/components/MobileNav';
import { EmptyState } from '@/components/EmptyState';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const { categories, searchQuery } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  const filteredCategories = categories
    .sort((a, b) => a.order - b.order)
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
