import { useState, useEffect, useCallback } from 'react';
import { Tool } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface ToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  tool?: Tool;
}

const getFaviconUrl = (url: string): string | null => {
  try {
    const domain = new URL(url).hostname;
    // Use Google's favicon service for reliable favicon fetching
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return null;
  }
};

export const ToolDialog = ({ open, onOpenChange, categoryId, tool }: ToolDialogProps) => {
  const { addTool, updateTool } = useApp();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingLogo, setFetchingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const isEditing = !!tool;

  useEffect(() => {
    if (tool) {
      setName(tool.name);
      setUrl(tool.url);
      setDescription(tool.description || '');
      setIcon(tool.icon || '');
      setTags(tool.tags?.join(', ') || '');
      // Check if icon is a URL (logo)
      if (tool.icon?.startsWith('http')) {
        setLogoPreview(tool.icon);
      } else {
        setLogoPreview(null);
      }
    } else {
      setName('');
      setUrl('');
      setDescription('');
      setIcon('');
      setTags('');
      setLogoPreview(null);
    }
  }, [tool, open]);

  // Debounced URL change handler to fetch favicon
  const fetchLogo = useCallback(async (urlValue: string) => {
    if (!urlValue) {
      setLogoPreview(null);
      return;
    }

    try {
      new URL(urlValue); // Validate URL
      setFetchingLogo(true);
      const faviconUrl = getFaviconUrl(urlValue);
      
      if (faviconUrl) {
        // Test if the favicon loads successfully
        const img = new window.Image();
        img.onload = () => {
          setLogoPreview(faviconUrl);
          setIcon(faviconUrl);
          setFetchingLogo(false);
        };
        img.onerror = () => {
          setLogoPreview(null);
          setFetchingLogo(false);
        };
        img.src = faviconUrl;
      } else {
        setFetchingLogo(false);
      }
    } catch {
      setLogoPreview(null);
      setFetchingLogo(false);
    }
  }, []);

  // Fetch logo when URL changes (with debounce)
  useEffect(() => {
    if (!isEditing && url) {
      const timer = setTimeout(() => {
        fetchLogo(url);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [url, isEditing, fetchLogo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const toolData = {
        name,
        url,
        description: description || undefined,
        icon: icon || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      };

      if (isEditing && tool) {
        await updateTool(categoryId, tool.id, toolData);
      } else {
        await addTool(categoryId, toolData);
      }

      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Tool' : 'Add New Tool'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., ChatGPT"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://chat.openai.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the tool"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center overflow-hidden">
                {fetchingLogo ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-8 h-8 object-contain"
                    onError={() => setLogoPreview(null)}
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 text-xs text-muted-foreground">
                {fetchingLogo ? (
                  'Fetching logo...'
                ) : logoPreview ? (
                  'Logo detected automatically'
                ) : (
                  'Enter a URL to auto-fetch the logo'
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="AI, Chat, Productivity"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Tool'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
