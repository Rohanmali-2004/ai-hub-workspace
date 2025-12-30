import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { defaultCategories as defaultCategoriesData } from '@/types';

interface Tool {
  id: string;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  tags?: string[];
  sort_order: number;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  tools: Tool[];
  sort_order: number;
}

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
}

interface AppContextType {
  categories: Category[];
  profile: Profile | null;
  theme: 'light' | 'dark';
  searchQuery: string;
  loading: boolean;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addCategory: (name: string, icon?: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categoryIds: string[]) => Promise<void>;
  addTool: (categoryId: string, tool: Omit<Tool, 'id' | 'sort_order'>) => Promise<void>;
  updateTool: (categoryId: string, toolId: string, updates: Partial<Tool>) => Promise<void>;
  deleteTool: (categoryId: string, toolId: string) => Promise<void>;
  reorderTools: (categoryId: string, toolIds: string[]) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  exportData: () => void;
  importData: (data: string) => Promise<void>;
  resetWorkspace: () => Promise<void>;
  seedDefaultCategories: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'intelyx-theme';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Fetch data when user changes
  const fetchData = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch categories with tools
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (catError) throw catError;

      // Fetch all tools for user
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (toolsError) throw toolsError;

      // Combine categories with their tools
      const categoriesWithTools = (categoriesData || []).map(cat => ({
        ...cat,
        tools: (toolsData || []).filter(tool => tool.category_id === cat.id),
      }));

      setCategories(categoriesWithTools);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load your workspace');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    toast.success(`Switched to ${newTheme} mode`);
  };

  const addCategory = async (name: string, icon?: string) => {
    if (!user) return;

    const maxOrder = categories.length > 0 
      ? Math.max(...categories.map(c => c.sort_order)) + 1 
      : 0;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name,
        icon: icon || '📁',
        sort_order: maxOrder,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create category');
      return;
    }

    setCategories([...categories, { ...data, tools: [] }]);
    toast.success(`Category "${name}" created`);
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { error } = await supabase
      .from('categories')
      .update({ name: updates.name, icon: updates.icon })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update category');
      return;
    }

    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ));
    toast.success('Category updated');
  };

  const deleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete category');
      return;
    }

    setCategories(categories.filter(cat => cat.id !== id));
    toast.success(`Category "${category?.name}" deleted`);
  };

  const reorderCategories = async (categoryIds: string[]) => {
    if (!user) return;

    // Update local state immediately for smooth UX
    const reorderedCategories = categoryIds.map((id, index) => {
      const cat = categories.find(c => c.id === id)!;
      return { ...cat, sort_order: index };
    });
    setCategories(reorderedCategories);

    // Update database
    const updates = categoryIds.map((id, index) => ({
      id,
      user_id: user.id,
      sort_order: index,
    }));

    for (const update of updates) {
      await supabase
        .from('categories')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id);
    }
  };

  const addTool = async (categoryId: string, tool: Omit<Tool, 'id' | 'sort_order'>) => {
    if (!user) return;

    const category = categories.find(c => c.id === categoryId);
    const maxOrder = category && category.tools.length > 0
      ? Math.max(...category.tools.map(t => t.sort_order)) + 1
      : 0;

    const { data, error } = await supabase
      .from('tools')
      .insert({
        category_id: categoryId,
        user_id: user.id,
        name: tool.name,
        url: tool.url,
        description: tool.description,
        icon: tool.icon,
        tags: tool.tags,
        sort_order: maxOrder,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add tool');
      return;
    }

    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, tools: [...cat.tools, data] }
        : cat
    ));
    toast.success(`Tool "${tool.name}" added`);
  };

  const updateTool = async (categoryId: string, toolId: string, updates: Partial<Tool>) => {
    const { error } = await supabase
      .from('tools')
      .update({
        name: updates.name,
        url: updates.url,
        description: updates.description,
        icon: updates.icon,
        tags: updates.tags,
      })
      .eq('id', toolId);

    if (error) {
      toast.error('Failed to update tool');
      return;
    }

    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            tools: cat.tools.map(tool =>
              tool.id === toolId ? { ...tool, ...updates } : tool
            ),
          }
        : cat
    ));
    toast.success('Tool updated');
  };

  const deleteTool = async (categoryId: string, toolId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const tool = category?.tools.find(t => t.id === toolId);

    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', toolId);

    if (error) {
      toast.error('Failed to delete tool');
      return;
    }

    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, tools: cat.tools.filter(t => t.id !== toolId) }
        : cat
    ));
    toast.success(`Tool "${tool?.name}" removed`);
  };

  const reorderTools = async (categoryId: string, toolIds: string[]) => {
    if (!user) return;

    // Update local state immediately
    setCategories(categories.map(cat => {
      if (cat.id !== categoryId) return cat;
      const reorderedTools = toolIds.map((id, index) => {
        const tool = cat.tools.find(t => t.id === id)!;
        return { ...tool, sort_order: index };
      });
      return { ...cat, tools: reorderedTools };
    }));

    // Update database
    for (let i = 0; i < toolIds.length; i++) {
      await supabase
        .from('tools')
        .update({ sort_order: i })
        .eq('id', toolIds[i]);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({ username: updates.username, avatar_url: updates.avatar_url })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update profile');
      return;
    }

    setProfile({ ...profile, ...updates });
    toast.success('Profile updated');
  };

  const exportData = () => {
    const data = {
      categories: categories.map(cat => ({
        name: cat.name,
        icon: cat.icon,
        sort_order: cat.sort_order,
        tools: cat.tools.map(tool => ({
          name: tool.name,
          url: tool.url,
          description: tool.description,
          icon: tool.icon,
          tags: tool.tags,
          sort_order: tool.sort_order,
        })),
      })),
      theme,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelyx-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const importData = async (dataString: string) => {
    if (!user) return;

    try {
      const data = JSON.parse(dataString);
      if (!data.categories || !Array.isArray(data.categories)) {
        toast.error('Invalid data format');
        return;
      }

      // Delete existing data
      await supabase.from('categories').delete().eq('user_id', user.id);

      // Import categories and tools
      for (let i = 0; i < data.categories.length; i++) {
        const cat = data.categories[i];
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: cat.name,
            icon: cat.icon || '📁',
            sort_order: i,
          })
          .select()
          .single();

        if (catError || !newCat) continue;

        // Insert tools for this category
        if (cat.tools && Array.isArray(cat.tools)) {
          for (let j = 0; j < cat.tools.length; j++) {
            const tool = cat.tools[j];
            await supabase.from('tools').insert({
              category_id: newCat.id,
              user_id: user.id,
              name: tool.name,
              url: tool.url,
              description: tool.description,
              icon: tool.icon,
              tags: tool.tags,
              sort_order: j,
            });
          }
        }
      }

      if (data.theme) setThemeState(data.theme);
      
      await fetchData();
      toast.success('Data imported successfully');
    } catch {
      toast.error('Failed to parse import data');
    }
  };

  const seedDefaultCategories = async () => {
    if (!user) return;

    for (let i = 0; i < defaultCategoriesData.length; i++) {
      const cat = defaultCategoriesData[i];
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: cat.name,
          icon: cat.icon || '📁',
          sort_order: i,
        })
        .select()
        .single();

      if (catError || !newCat) continue;

      for (let j = 0; j < cat.tools.length; j++) {
        const tool = cat.tools[j];
        await supabase.from('tools').insert({
          category_id: newCat.id,
          user_id: user.id,
          name: tool.name,
          url: tool.url,
          description: tool.description,
          icon: tool.icon,
          tags: tool.tags,
          sort_order: j,
        });
      }
    }

    await fetchData();
    toast.success('Default categories added');
  };

  const resetWorkspace = async () => {
    if (!user) return;

    await supabase.from('categories').delete().eq('user_id', user.id);
    await seedDefaultCategories();
    toast.success('Workspace reset to defaults');
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <AppContext.Provider value={{
      categories,
      profile,
      theme,
      searchQuery,
      loading,
      setSearchQuery,
      setTheme,
      addCategory,
      updateCategory,
      deleteCategory,
      reorderCategories,
      addTool,
      updateTool,
      deleteTool,
      reorderTools,
      updateProfile,
      exportData,
      importData,
      resetWorkspace,
      seedDefaultCategories,
      refreshData,
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
