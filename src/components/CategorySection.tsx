import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Category as CategoryType, Tool } from '@/types';
import { useApp } from '@/context/AppContext';
import { ToolCard } from './ToolCard';
import { SortableToolCard } from './SortableToolCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ToolDialog } from './ToolDialog';
import { CategoryDialog } from './CategoryDialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface CategorySectionProps {
  category: CategoryType;
  searchQuery: string;
}

export const CategorySection = ({ category, searchQuery }: CategorySectionProps) => {
  const { deleteCategory, deleteTool, reorderTools } = useApp();
  const [isOpen, setIsOpen] = useState(true);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [addToolOpen, setAddToolOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [deleteToolData, setDeleteToolData] = useState<Tool | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTools = category.tools
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter(tool => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.description?.toLowerCase().includes(query) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = filteredTools.findIndex(t => t.id === active.id);
      const newIndex = filteredTools.findIndex(t => t.id === over.id);
      const newOrder = arrayMove(filteredTools, oldIndex, newIndex);
      await reorderTools(category.id, newOrder.map(t => t.id));
    }
  };

  if (searchQuery && filteredTools.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card variant="glass" className="overflow-hidden">
          {/* Category Header */}
          <div className="p-4 flex items-center justify-between border-b border-border/50">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                <span className="text-xl">{category.icon}</span>
                <h2 className="text-lg font-semibold text-foreground">{category.name}</h2>
                <span className="text-sm text-muted-foreground">({filteredTools.length})</span>
                <ChevronDown 
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </button>
            </CollapsibleTrigger>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                onClick={() => setAddToolOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Add Tool</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                onClick={() => setEditCategoryOpen(true)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteCategoryOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tools Grid */}
          <CollapsibleContent>
            <div className="p-4">
              {filteredTools.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredTools.map(t => t.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      <AnimatePresence mode="popLayout">
                        {filteredTools.map((tool) => (
                          <SortableToolCard
                            key={tool.id}
                            tool={tool}
                            onEdit={() => setEditingTool(tool)}
                            onDelete={() => setDeleteToolData(tool)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No tools in this category yet</p>
                  <Button variant="outline" onClick={() => setAddToolOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add your first tool
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Dialogs */}
      <ToolDialog
        open={addToolOpen}
        onOpenChange={setAddToolOpen}
        categoryId={category.id}
      />

      <ToolDialog
        open={!!editingTool}
        onOpenChange={(open) => !open && setEditingTool(null)}
        categoryId={category.id}
        tool={editingTool || undefined}
      />

      <CategoryDialog
        open={editCategoryOpen}
        onOpenChange={setEditCategoryOpen}
        category={category}
      />

      <AlertDialog open={deleteCategoryOpen} onOpenChange={setDeleteCategoryOpen}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{category.name}"? This will also delete all {category.tools.length} tools inside it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteCategory(category.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteToolData} onOpenChange={(open) => !open && setDeleteToolData(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteToolData?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteToolData) {
                  deleteTool(category.id, deleteToolData.id);
                  setDeleteToolData(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
