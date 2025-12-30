import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, ExternalLink, X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Suggestion {
  name: string;
  url: string;
  description: string;
  icon: string;
  tags: string[];
  reason: string;
}

export const AISuggestions = () => {
  const { categories, addTool } = useApp();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);

  const allTools = categories.flatMap(cat => cat.tools);

  const fetchSuggestions = async () => {
    setLoading(true);
    setIsOpen(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-suggestions', {
        body: {
          tools: allTools.map(t => ({ name: t.name, url: t.url, tags: t.tags })),
          categories: categories.map(c => ({ name: c.name })),
        },
      });

      if (error) throw error;

      if (data?.suggestions?.length) {
        setSuggestions(data.suggestions);
      } else {
        toast.error('No suggestions available');
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      toast.error('Failed to get AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = async (suggestion: Suggestion, index: number) => {
    if (categories.length === 0) {
      toast.error('Create a category first');
      return;
    }

    setAddingIndex(index);
    
    // Find the best matching category or use the first one
    const targetCategory = categories[0];
    
    await addTool(targetCategory.id, {
      name: suggestion.name,
      url: suggestion.url,
      description: suggestion.description,
      icon: suggestion.icon,
      tags: suggestion.tags,
    });

    setSuggestions(prev => prev.filter((_, i) => i !== index));
    setAddingIndex(null);
    toast.success(`Added "${suggestion.name}" to ${targetCategory.name}`);
  };

  return (
    <div className="relative">
      <Button
        onClick={fetchSuggestions}
        variant="outline"
        size="sm"
        className="gap-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary" />
        )}
        AI Suggest
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-12 z-50 w-[380px] max-h-[480px] overflow-hidden rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">AI Suggestions</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={fetchSuggestions}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-3" />
                  <p className="text-sm">Analyzing your workspace...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No suggestions yet</p>
                  <p className="text-xs mt-1">Click refresh to get AI recommendations</p>
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <motion.div
                    key={`${suggestion.name}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group hover:border-primary/30 transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{suggestion.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{suggestion.name}</h4>
                              <a
                                href={suggestion.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                              </a>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {suggestion.description}
                            </p>
                            <p className="text-xs text-primary/80 mt-2 italic">
                              {suggestion.reason}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {suggestion.tags?.slice(0, 3).map(tag => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleAddTool(suggestion, index)}
                            disabled={addingIndex === index}
                          >
                            {addingIndex === index ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
