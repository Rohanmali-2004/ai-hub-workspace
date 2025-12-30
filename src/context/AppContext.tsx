import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, Category, Tool, defaultCategories, generateId } from '@/types';
import { toast } from 'sonner';

interface AppContextType {
  categories: Category[];
  theme: 'light' | 'dark';
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addCategory: (name: string, icon?: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (startIndex: number, endIndex: number) => void;
  addTool: (categoryId: string, tool: Omit<Tool, 'id'>) => void;
  updateTool: (categoryId: string, toolId: string, updates: Partial<Tool>) => void;
  deleteTool: (categoryId: string, toolId: string) => void;
  exportData: () => void;
  importData: (data: string) => void;
  resetWorkspace: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'intelyx-data';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: AppData = JSON.parse(stored);
        setCategories(data.categories);
        setThemeState(data.theme);
      } catch {
        setCategories(defaultCategories);
      }
    } else {
      setCategories(defaultCategories);
    }
    setIsLoaded(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      const data: AppData = { categories, theme };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [categories, theme, isLoaded]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    toast.success(`Switched to ${newTheme} mode`);
  };

  const addCategory = (name: string, icon?: string) => {
    const newCategory: Category = {
      id: generateId(),
      name,
      icon: icon || '📁',
      tools: [],
      order: categories.length,
    };
    setCategories([...categories, newCategory]);
    toast.success(`Category "${name}" created`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
    toast.success('Category updated');
  };

  const deleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    setCategories(categories.filter(cat => cat.id !== id));
    toast.success(`Category "${category?.name}" deleted`);
  };

  const reorderCategories = (startIndex: number, endIndex: number) => {
    const result = Array.from(categories);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setCategories(result.map((cat, index) => ({ ...cat, order: index })));
  };

  const addTool = (categoryId: string, tool: Omit<Tool, 'id'>) => {
    const newTool: Tool = { ...tool, id: generateId() };
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, tools: [...cat.tools, newTool] }
        : cat
    ));
    toast.success(`Tool "${tool.name}" added`);
  };

  const updateTool = (categoryId: string, toolId: string, updates: Partial<Tool>) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, tools: cat.tools.map(tool =>
            tool.id === toolId ? { ...tool, ...updates } : tool
          )}
        : cat
    ));
    toast.success('Tool updated');
  };

  const deleteTool = (categoryId: string, toolId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const tool = category?.tools.find(t => t.id === toolId);
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, tools: cat.tools.filter(tool => tool.id !== toolId) }
        : cat
    ));
    toast.success(`Tool "${tool?.name}" removed`);
  };

  const exportData = () => {
    const data: AppData = { categories, theme };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelyx-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const importData = (dataString: string) => {
    try {
      const data: AppData = JSON.parse(dataString);
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
        if (data.theme) setThemeState(data.theme);
        toast.success('Data imported successfully');
      } else {
        toast.error('Invalid data format');
      }
    } catch {
      toast.error('Failed to parse import data');
    }
  };

  const resetWorkspace = () => {
    setCategories(defaultCategories);
    setThemeState('dark');
    toast.success('Workspace reset to defaults');
  };

  return (
    <AppContext.Provider value={{
      categories,
      theme,
      searchQuery,
      setSearchQuery,
      setTheme,
      addCategory,
      updateCategory,
      deleteCategory,
      reorderCategories,
      addTool,
      updateTool,
      deleteTool,
      exportData,
      importData,
      resetWorkspace,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
