import { useState, useEffect } from 'react';
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

interface ToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  tool?: Tool;
}

export const ToolDialog = ({ open, onOpenChange, categoryId, tool }: ToolDialogProps) => {
  const { addTool, updateTool } = useApp();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [tags, setTags] = useState('');

  const isEditing = !!tool;

  useEffect(() => {
    if (tool) {
      setName(tool.name);
      setUrl(tool.url);
      setDescription(tool.description || '');
      setIcon(tool.icon || '');
      setTags(tool.tags?.join(', ') || '');
    } else {
      setName('');
      setUrl('');
      setDescription('');
      setIcon('');
      setTags('');
    }
  }, [tool, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const toolData = {
      name,
      url,
      description: description || undefined,
      icon: icon || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    };

    if (isEditing && tool) {
      updateTool(categoryId, tool.id, toolData);
    } else {
      addTool(categoryId, toolData);
    }

    onOpenChange(false);
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🤖"
                maxLength={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="AI, Chat"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Add Tool'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
