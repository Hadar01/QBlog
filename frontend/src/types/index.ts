export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string; // Markdown-like text
  tags: string[];
  createdAt: string;
  readingTime?: number;
}

export interface Visitor {
  id: string;
  name: string;
  timestamp: number;
}

export interface AdminSettings {
  webhookUrl?: string; // For n8n integration
  apiKey?: string; // Gemini API Key logic is handled via process.env usually, but user might want to input it for the demo if env is missing
}

export enum StorageKeys {
  POSTS = 'mindstream_posts',
  AUTH = 'mindstream_auth',
  SETTINGS = 'mindstream_settings',
  THEME = 'mindstream_theme',
  VISITORS = 'mindstream_visitors',
}