import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { ExternalLink, Search, FolderOpen, Settings, Moon, Sun, LogOut, Plus } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
  onAddCategory: () => void;
}

export const CommandPalette = ({ open, onOpenChange, onOpenSettings, onAddCategory }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const { categories, theme, setTheme } = useApp();
  const { signOut, user } = useAuth();

  const allTools = categories.flatMap(cat => 
    cat.tools.map(tool => ({
      ...tool,
      categoryName: cat.name,
      categoryIcon: cat.icon,
    }))
  );

  const handleToolSelect = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onOpenChange(false);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'settings':
        onOpenSettings();
        break;
      case 'add-category':
        onAddCategory();
        break;
      case 'toggle-theme':
        setTheme(theme === 'dark' ? 'light' : 'dark');
        break;
      case 'logout':
        signOut();
        navigate('/auth');
        break;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl border-border/50 bg-popover/95 backdrop-blur-xl max-w-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4">
          <div className="flex items-center border-b border-border/50 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandInput 
              placeholder="Search tools, categories, or actions..." 
              className="flex h-14 w-full bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              ESC
            </kbd>
          </div>
          <CommandList className="max-h-[400px] overflow-y-auto p-2">
            <CommandEmpty className="py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No results found.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
            </CommandEmpty>

            {/* Tools */}
            {allTools.length > 0 && (
              <CommandGroup heading="Tools">
                {allTools.slice(0, 8).map((tool) => (
                  <CommandItem
                    key={tool.id}
                    value={`${tool.name} ${tool.description || ''} ${tool.categoryName} ${tool.tags?.join(' ') || ''}`}
                    onSelect={() => handleToolSelect(tool.url)}
                    className="flex items-center gap-3 rounded-lg cursor-pointer group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-aria-selected:border-primary/40 transition-colors">
                      {tool.icon ? (
                        <span className="text-lg">{tool.icon}</span>
                      ) : (
                        <span className="text-primary font-semibold text-sm">
                          {tool.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{tool.name}</span>
                        <span className="text-xs text-muted-foreground/70 truncate">
                          {tool.categoryIcon} {tool.categoryName}
                        </span>
                      </div>
                      {tool.description && (
                        <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                      )}
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-aria-selected:opacity-100 transition-opacity" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <>
                <CommandSeparator className="my-2" />
                <CommandGroup heading="Categories">
                  {categories.slice(0, 5).map((category) => (
                    <CommandItem
                      key={category.id}
                      value={`category ${category.name}`}
                      onSelect={() => onOpenChange(false)}
                      className="flex items-center gap-3 rounded-lg cursor-pointer"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                        <span className="text-lg">{category.icon}</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{category.name}</span>
                        <p className="text-xs text-muted-foreground">{category.tools.length} tools</p>
                      </div>
                      <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Quick Actions */}
            <CommandSeparator className="my-2" />
            <CommandGroup heading="Quick Actions">
              <CommandItem
                value="add new category"
                onSelect={() => handleAction('add-category')}
                className="flex items-center gap-3 rounded-lg cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="font-medium">Add New Category</span>
              </CommandItem>
              <CommandItem
                value="open settings preferences"
                onSelect={() => handleAction('settings')}
                className="flex items-center gap-3 rounded-lg cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="font-medium">Open Settings</span>
              </CommandItem>
              <CommandItem
                value="toggle theme dark light mode"
                onSelect={() => handleAction('toggle-theme')}
                className="flex items-center gap-3 rounded-lg cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </div>
                <span className="font-medium">
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </span>
              </CommandItem>
              {user && (
                <CommandItem
                  value="sign out logout"
                  onSelect={() => handleAction('logout')}
                  className="flex items-center gap-3 rounded-lg cursor-pointer"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Sign Out</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/50 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
                select
              </span>
            </div>
            <span className="text-primary font-medium">INTELYX</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

// Hook to manage command palette state globally
export const useCommandPalette = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
};
