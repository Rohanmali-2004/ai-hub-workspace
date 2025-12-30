import { motion } from 'framer-motion';
import { ExternalLink, Edit2, Trash2, Globe } from 'lucide-react';
import { Tool } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ToolCardProps {
  tool: Tool;
  onEdit: () => void;
  onDelete: () => void;
}

export const ToolCard = ({ tool, onEdit, onDelete }: ToolCardProps) => {
  const handleClick = () => {
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        variant="interactive" 
        className="group relative overflow-hidden h-full"
        onClick={handleClick}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              {tool.icon ? (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20 group-hover:border-primary/40 transition-colors">
                  <span className="text-2xl">{tool.icon}</span>
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20 group-hover:border-primary/40 transition-colors">
                  <span className="text-primary font-bold text-lg">
                    {tool.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                {tool.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {tool.description}
                  </p>
                )}
              </div>
            </div>
            
            <ExternalLink className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-1" />
          </div>

          {/* URL hint */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
            <Globe className="w-3 h-3" />
            <span className="truncate">{getDomainFromUrl(tool.url)}</span>
          </div>

          {/* Tags */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tool.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-5 bg-secondary/50"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit2 className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
