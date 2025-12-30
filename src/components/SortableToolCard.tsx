import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tool } from '@/types';
import { ToolCard } from './ToolCard';

interface SortableToolCardProps {
  tool: Tool;
  onEdit: () => void;
  onDelete: () => void;
}

export const SortableToolCard = ({ tool, onEdit, onDelete }: SortableToolCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tool.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ToolCard tool={tool} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};
