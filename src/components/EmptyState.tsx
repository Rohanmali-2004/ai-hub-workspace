import { motion } from 'framer-motion';
import { Sparkles, Folder, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddCategory: () => void;
}

export const EmptyState = ({ onAddCategory }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-float">
          <Sparkles className="w-12 h-12 text-primary-foreground" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-primary blur-2xl opacity-40" />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
        Your workspace is empty
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Start building your personal AI command center by adding categories and tools. 
        Organize your favorite AI platforms in one beautiful dashboard.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="glow" size="lg" onClick={onAddCategory}>
          <Folder className="w-5 h-5 mr-2" />
          Create First Category
        </Button>
      </div>

      {/* Feature hints */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
        {[
          { icon: Folder, title: 'Organize', desc: 'Group tools into categories' },
          { icon: Zap, title: 'Quick Access', desc: 'One-click to any tool' },
          { icon: Sparkles, title: 'Personalize', desc: 'Add icons and descriptions' },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="flex flex-col items-center p-4 rounded-xl bg-secondary/30"
          >
            <feature.icon className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium text-sm">{feature.title}</h3>
            <p className="text-xs text-muted-foreground">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
