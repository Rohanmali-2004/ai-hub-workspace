export interface Tool {
  id: string;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  tags?: string[];
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  tools: Tool[];
  sort_order: number;
}

export interface AppData {
  categories: Category[];
  theme: 'light' | 'dark';
}

export const defaultCategories: Category[] = [
  {
    id: 'vibe-coding',
    name: 'Vibe Coding Platforms',
    icon: '💻',
    sort_order: 0,
    tools: [
      { id: 'cursor', name: 'Cursor', url: 'https://cursor.sh', description: 'AI-first code editor', tags: ['AI', 'IDE'], sort_order: 0 },
      { id: 'replit', name: 'Replit', url: 'https://replit.com', description: 'Collaborative browser IDE', tags: ['IDE', 'Collaboration'], sort_order: 1 },
      { id: 'lovable', name: 'Lovable', url: 'https://lovable.dev', description: 'AI-powered app builder', tags: ['AI', 'No-code'], sort_order: 2 },
      { id: 'bolt', name: 'Bolt.new', url: 'https://bolt.new', description: 'AI full-stack dev', tags: ['AI', 'Full-stack'], sort_order: 3 },
    ],
  },
  {
    id: 'ai-image',
    name: 'AI Image Generation',
    icon: '🎨',
    sort_order: 1,
    tools: [
      { id: 'midjourney', name: 'Midjourney', url: 'https://midjourney.com', description: 'AI art generation', tags: ['Art', 'Design'], sort_order: 0 },
      { id: 'dalle', name: 'DALL-E', url: 'https://openai.com/dall-e-3', description: 'OpenAI image generation', tags: ['OpenAI', 'Art'], sort_order: 1 },
      { id: 'leonardo', name: 'Leonardo.ai', url: 'https://leonardo.ai', description: 'Creative AI platform', tags: ['Art', 'Design'], sort_order: 2 },
      { id: 'ideogram', name: 'Ideogram', url: 'https://ideogram.ai', description: 'Text-to-image AI', tags: ['Art', 'Text'], sort_order: 3 },
    ],
  },
  {
    id: 'ai-video',
    name: 'AI Video Generation',
    icon: '🎬',
    sort_order: 2,
    tools: [
      { id: 'runway', name: 'Runway', url: 'https://runway.ml', description: 'AI video editing & generation', tags: ['Video', 'AI'], sort_order: 0 },
      { id: 'pika', name: 'Pika', url: 'https://pika.art', description: 'AI video creation', tags: ['Video', 'Animation'], sort_order: 1 },
      { id: 'heygen', name: 'HeyGen', url: 'https://heygen.com', description: 'AI avatar videos', tags: ['Avatar', 'Video'], sort_order: 2 },
      { id: 'sora', name: 'Sora', url: 'https://openai.com/sora', description: 'OpenAI video model', tags: ['OpenAI', 'Video'], sort_order: 3 },
    ],
  },
  {
    id: 'chat-ai',
    name: 'Chat AI',
    icon: '💬',
    sort_order: 3,
    tools: [
      { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com', description: 'OpenAI conversational AI', tags: ['OpenAI', 'Chat'], sort_order: 0 },
      { id: 'claude', name: 'Claude', url: 'https://claude.ai', description: 'Anthropic AI assistant', tags: ['Anthropic', 'Chat'], sort_order: 1 },
      { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', description: 'Google AI assistant', tags: ['Google', 'Chat'], sort_order: 2 },
      { id: 'perplexity', name: 'Perplexity', url: 'https://perplexity.ai', description: 'AI-powered search', tags: ['Search', 'Research'], sort_order: 3 },
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity Tools',
    icon: '⚡',
    sort_order: 4,
    tools: [
      { id: 'notion', name: 'Notion', url: 'https://notion.so', description: 'All-in-one workspace', tags: ['Notes', 'Docs'], sort_order: 0 },
      { id: 'linear', name: 'Linear', url: 'https://linear.app', description: 'Modern project management', tags: ['Project', 'Tasks'], sort_order: 1 },
      { id: 'figma', name: 'Figma', url: 'https://figma.com', description: 'Collaborative design tool', tags: ['Design', 'UI'], sort_order: 2 },
      { id: 'raycast', name: 'Raycast', url: 'https://raycast.com', description: 'Productivity launcher', tags: ['Launcher', 'Mac'], sort_order: 3 },
    ],
  },
];

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
