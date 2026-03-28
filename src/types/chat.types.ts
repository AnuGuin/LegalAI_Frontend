export type MessageRole = "user" | "assistant";
export type ChatMode = "normal" | "agentic";
export type BackendMode = "NORMAL" | "AGENTIC";

export interface Message {
  id: string;
  uiKey?: string;
  content: string;
  role: MessageRole;
  attachments?: string[];
  metadata?: MessageMetadata;
  createdAt?: Date | string;
}

export interface MessageMetadata {
  cached?: boolean;
  documentResult?: any;
  tools_used?: Array<{
    tool: string;
    query_time?: number;
    chunks_used?: number;
    total_chunks?: number;
  }>;
  document_id?: string;
  total_query_time?: number;
  total_chunks?: number;
}

export interface Conversation {
  id: string;
  userId?: string;
  title: string;
  mode?: BackendMode;
  documentId?: string;
  documentName?: string;
  sessionId?: string;
  messages?: Message[];
  isLoading?: boolean;
  lastMessage: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ConversationListItem {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: string;
}

export function toBackendMode(mode: ChatMode): BackendMode {
  return mode === 'normal' ? 'NORMAL' : 'AGENTIC';
}

export function toFrontendMode(mode: BackendMode): ChatMode {
  return mode === 'NORMAL' ? 'normal' : 'agentic';
}