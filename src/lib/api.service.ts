const NEXT_PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000').replace(/\/api$/, '');

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  preferences?: any;
  createdAt: string;
  lastLoginAt?: string;
}

interface Message {
  id: string;
  content: string;
  role: "USER" | "ASSISTANT";
  createdAt: string;
  attachments?: string[];
  metadata?: any;
}

interface Conversation {
  id: string;
  userId: string;
  title: string;
  mode: "NORMAL" | "AGENTIC";
  documentId?: string;
  documentName?: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

interface SendMessageResponse {
  message: Message;
  conversation: {
    id: string;
    sessionId?: string;
    documentId?: string;
  };
}

interface ShareConversationResponse {
  link?: string;
  message?: string;
}

interface Translation {
  id: string;
  userId: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  createdAt: string;
}

interface UserStats {
  documentAnalysisCount: number;
  translationCount: number;
}

interface TemplateField {
  name: string;
  required: boolean;       
  field_type: string;      
  description: string;     
  placeholder: string;     
}

interface TemplateSchema {
  template_name: string;
  all_fields: TemplateField[];
  critical_fields: string[];
  optional_fields: string[];
  total_fields: number;
  supports_auto_generation: boolean;
}


interface Document {
  id: string;
  title: string;
  format: string;
  fileUrl?: string;
  createdAt: string;
}

interface GenerateDocumentResult {
  documentId: string;          
  generationStatus: string;    
  completionPercentage: number;
  warning: string | null;      
  blob: Blob;                  
  filename: string;            
  mimeType: string;            
}

interface MatterParty {
  role: 'client' | 'opponent' | 'other';
  type?: 'company' | 'individual';
  name: string;
  phone?: string;
  email?: string;
  counsel?: string;
  roleLabel?: string;
}

interface CreateMatterPayload {
  title: string;
  practiceArea: string;
  court: string;
  caseNumber?: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  parties: MatterParty[];
}

interface Matter {
  id: string;
  title: string;
  practiceArea: string;
  court: string;
  caseNumber?: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  notes?: string;
  parties: MatterParty[];
  status?: string;
  stage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OmitMatter extends Omit<Matter, 'priority' | 'court' | 'description'> {}

export interface MatterDetail extends OmitMatter {
  description: string;
  practiceArea: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  client: MatterParty;
  opponent?: MatterParty;
  court?: string;
  caseNumber?: string;
  filingDate?: string;
}

export interface MatterMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
  attachments?: string[];
  metadata?: any;
}

export interface MatterDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy?: string;
  url?: string;
  originalName?: string;
  title?: string;
}

export interface MatterDeadline {
  id: string;
  title: string;
  notes?: string;
  day: string;
  month: string;
  urgency: 'normal' | 'high' | 'urgent';
  done: boolean;
  dueDate: string;
}

export interface WorkspaceMemory {
  id?: string;
  partySummary: string | null;
  factChronology: string | null;
  legalIssues: string | null;
  documentIndex: any | null;
  keyDates: any | null;
  lawyerNotes: string | null;
  aiSummary: string | null;
  estimatedTokens: number;
  lastUpdated?: string;
}

class ApiService {
  private ApiError = class ApiError extends Error {
    status: number
    body: any
    constructor(status: number, message: string, body?: any) {
      super(message)
      this.name = 'ApiError'
      this.status = status
      this.body = body
    }
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken') || 
           localStorage.getItem('lawyerToken') || 
           localStorage.getItem('lawyerAuthToken') || 
           localStorage.getItem('token');
  }

  private getLocalStats(): UserStats {
    try {
      const stats = localStorage.getItem('userStats');
      return stats ? JSON.parse(stats) : { documentAnalysisCount: 0, translationCount: 0 };
    } catch {
      return { documentAnalysisCount: 0, translationCount: 0 };
    }
  }

  private updateLocalStats(type: 'doc' | 'trans') {
    const stats = this.getLocalStats();
    if (type === 'doc') stats.documentAnalysisCount++;
    if (type === 'trans') stats.translationCount++;
    localStorage.setItem('userStats', JSON.stringify(stats));
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = `${NEXT_PUBLIC_API_URL}${endpoint}`;
      let requestBodyForLog: any = undefined;
      try {
        if (options.body instanceof FormData) {
          requestBodyForLog = Array.from((options.body as FormData).keys());
        } else if (typeof options.body === 'string') {
          try {
            requestBodyForLog = JSON.parse(options.body as string);
          } catch {
            requestBodyForLog = (options.body as string).slice(0, 1000);
          }
        }
      } catch (e) {
        requestBodyForLog = 'Unable to inspect body for log';
      }

      console.log('API Request:', { method: options.method || 'GET', url, headers, body: requestBodyForLog });
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => '');
        let errorData: any = undefined;
        try {
          errorData = responseText ? JSON.parse(responseText) : undefined;
        } catch {
          //error
        }

        const errorMessageFromBody = (errorData && (errorData.message || errorData.error)) || responseText || `HTTP error! status: ${response.status}`;
        console.error('API Error: url=', url, ' status=', response.status, ' statusText=', response.statusText)
        throw new this.ApiError(response.status, `HTTP ${response.status}: ${errorMessageFromBody}`, errorData ?? responseText);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ==================== User Profile APIs ====================

  async getUserProfile(): Promise<UserProfile> {
    const response = await this.request<ApiResponse<UserProfile>>('/api/user/profile');
    if (!response.success || !response.data) throw new Error('Failed to fetch user profile');
    return response.data;
  }

  async updateUserProfile(data: { name?: string; avatar?: string; preferences?: any }): Promise<UserProfile> {
    const response = await this.request<ApiResponse<UserProfile>>(
      '/api/user/profile',
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
    if (!response.success || !response.data) {
      throw new Error('Failed to update profile');
    }
    return response.data;
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const response = await this.request<ApiResponse<any>>('/api/user/stats');
      const localStats = this.getLocalStats();
      return {
        documentAnalysisCount: (response.data?.documentAnalysisCount || 0) + localStats.documentAnalysisCount,
        translationCount: (response.data?.translationCount || 0) + localStats.translationCount
      };
    } catch (e) {
      console.warn('Failed to fetch server stats, using local stats', e);
      return this.getLocalStats();
    }
  }

  async deleteAccount(): Promise<void> {
    const response = await this.request<ApiResponse<void>>(
      '/api/user/profile', 
      { method: 'DELETE' }
    );
    if (!response.success) {
      throw new Error('Failed to delete account');
    }
  }

  // ==================== Conversation APIs ====================

  async createConversation(
    mode: 'NORMAL' | 'AGENTIC',
    title?: string,
    documentId?: string,
    documentName?: string,
    sessionId?: string
  ): Promise<Conversation> {
    const response = await this.request<ApiResponse<Conversation>>(
      '/api/chat/conversations',
      {
        method: 'POST',
        body: JSON.stringify({
          mode,
          title,
          documentId,
          documentName,
          sessionId,
        }),
      }
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to create conversation');
    }

    return response.data;
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await this.request<ApiResponse<Conversation[]>>(
      '/api/chat/conversations'
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch conversations');
    }
    return response.data;
  }

  async getConversationMessages(conversationId: string): Promise<Conversation> {
    const response = await this.request<ApiResponse<Conversation>>(
      `/api/chat/conversations/${conversationId}`
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch conversation messages');
    }
    return response.data;
  }

  async getConversationInfo(conversationId: string): Promise<Conversation> {
    const response = await this.request<ApiResponse<Conversation>>(
      `/api/chat/conversations/${conversationId}/info`
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch conversation info');
    }

    return response.data;
  }

  async sendMessage(
    conversationId: string,
    message: string,
    mode: 'NORMAL' | 'AGENTIC',
    file?: File
  ): Promise<SendMessageResponse> {
    let body: FormData | string;
    let headers: HeadersInit = {};

    if (file) {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('mode', mode);
      formData.append('file', file);
      body = formData;
    } else {
      body = JSON.stringify({ message, mode });
      headers['Content-Type'] = 'application/json';
    }

    const response = await this.request<ApiResponse<SendMessageResponse>>(
      `/api/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers,
        body,
      }
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to send message');
    }

    if (file || mode === 'AGENTIC') {
       this.updateLocalStats('doc');
    }

    return response.data;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const response = await this.request<ApiResponse<void>>(
      `/api/chat/conversations/${conversationId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.success) {
      throw new Error('Failed to delete conversation');
    }
  }

  async deleteAllConversations(): Promise<{ deletedCount: number }> {
    const response = await this.request<ApiResponse<{ deletedCount: number }>>(
      '/api/chat/conversations',
      {
        method: 'DELETE',
      }
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to delete conversations');
    }

    return response.data;
  }

  async shareConversation(conversationId: string, share: boolean): Promise<ShareConversationResponse> {
    const response = await this.request<ApiResponse<ShareConversationResponse>>(
      `/api/chat/conversations/${conversationId}/share`,
      {
        method: 'POST',
        body: JSON.stringify({ share }),
      }
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to update sharing status');
    }

    return response.data;
  }

  async getSharedConversation(shareLink: string): Promise<{ userName: string; conversation: Conversation }> {
    const response = await this.request<ApiResponse<{ userName: string; conversation: Conversation }>>(
      `/api/chat/shared/${encodeURIComponent(shareLink)}`
    );

    if (!response.success || !response.data) {
      throw new Error('Failed to fetch shared conversation');
    }

    return response.data;
  }

  // ==================== Translation APIs ====================

  async translateText(params: {
    text: string;
    sourceLang: string;
    targetLang: string;
  }): Promise<ApiResponse<Translation>> {
    const response = await this.request<ApiResponse<Translation>>(
      '/api/translation/translate',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
    
    if (response.success) {
        this.updateLocalStats('trans');
    }
    
    return response;
  }

  async detectLanguage(text: string): Promise<ApiResponse<{ language: string; display_name: string }>> {
    return await this.request<ApiResponse<{ language: string; display_name: string }>>(
      '/api/translation/detect-language',
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      }
    );
  }

  async getTranslationHistory(): Promise<ApiResponse<Translation[]>> {
    return await this.request<ApiResponse<Translation[]>>('/api/translation/history');
  }

  // ==================== Document APIs ====================

  async generateDocument(
    templateName: string,
    data: Record<string, any>,
    format: 'pdf' | 'docx' | 'txt' = 'pdf'
  ): Promise<GenerateDocumentResult> {
    const token = this.getAuthToken();
    const url = `${NEXT_PUBLIC_API_URL}/api/documents`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ template_name: templateName, data, format }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let msg = text;
      try {
        const parsed = JSON.parse(text);
        msg = parsed.message || parsed.error || text;
      } catch { /* not JSON */ }
      throw new this.ApiError(response.status, `HTTP ${response.status}: ${msg}`);
    }

    const blob = await response.blob();

    const disposition = response.headers.get('Content-Disposition') ?? '';
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : `document.${format}`;

    return {
      blob,
      filename,
      mimeType: response.headers.get('Content-Type') ?? 'application/octet-stream',
      documentId: response.headers.get('X-Document-Id') ?? '',
      generationStatus: response.headers.get('X-Generation-Status') ?? 'complete',
      completionPercentage: parseInt(response.headers.get('X-Completion-Percentage') ?? '100', 10),
      warning: response.headers.get('X-Generation-Warning') ?? null,
    };
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async getDocuments(): Promise<Document[]> {
    const response = await this.request<ApiResponse<Document[]>>('/api/documents');
    if (!response.success || !response.data) throw new Error('Failed to fetch documents');
    return response.data;
  }

  async getDocument(id: string): Promise<Document> {
    const response = await this.request<ApiResponse<Document>>(`/api/documents/${id}`);
    if (!response.success || !response.data) throw new Error('Failed to fetch document');
    return response.data;
  }

  async deleteDocument(id: string): Promise<void> {
    const response = await this.request<ApiResponse<void>>(`/api/documents/${id}`, { method: 'DELETE' });
    if (!response.success) throw new Error('Failed to delete document');
  }

  async getDocumentTemplates(): Promise<{ available_templates: string[]; total_count: number }> {
    const response = await this.request<ApiResponse<{ available_templates: string[]; total_count: number }>>('/api/documents/templates');
    if (!response.success || !response.data) throw new Error('Failed to fetch document templates');
    return response.data;
  }


  async getTemplateSchema(templateName: string): Promise<TemplateSchema> {
      const safeName = templateName.replace('.j2', ''); 
      const response = await this.request<ApiResponse<TemplateSchema>>(
        `/api/documents/templates/${encodeURIComponent(safeName)}/schema`
      );
      if (!response.success || !response.data) throw new Error('Failed to fetch template schema');
      return response.data;
    }

  async downloadDocument(id: string): Promise<void> {
    const token = this.getAuthToken();
    const url = `${NEXT_PUBLIC_API_URL}/api/documents/${id}/download`;

    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) throw new this.ApiError(response.status, `Download failed: ${response.status}`);

    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : `document`;
    this.downloadBlob(blob, filename);
  }

  // ==================== Matter Workspace APIs ====================

  async createMatter(payload: CreateMatterPayload): Promise<Matter> {
    const response = await this.request<ApiResponse<Matter>>(
      '/api/lawyer/matter',
      { method: 'POST', body: JSON.stringify(payload) }
    );
    if (!response.success || !response.data) throw new Error(response.message || 'Failed to create matter');
    return response.data;
  }

  async getMatter(matterId: string): Promise<MatterDetail> {
    const response = await this.request<ApiResponse<MatterDetail>>(`/api/lawyer/matter/${matterId}`);
    if (!response.success || !response.data) throw new Error(response.message || 'Failed to fetch matter');
    return response.data;
  }

  async getLawyerConversation(conversationId: string): Promise<any> {
    const response = await this.request<ApiResponse<any>>(`/api/lawyer/chat/conversations/${conversationId}`);
    if (!response.success || !response.data) throw new Error('Failed to fetch conversation');
    return response.data;
  }

  async deleteLawyerConversation(conversationId: string): Promise<void> {
    const response = await this.request<ApiResponse<void>>(`/api/lawyer/chat/conversations/${conversationId}`, {
      method: "DELETE"
    });
    if (!response.success) throw new Error('Failed to delete conversation');
  }

  async getMatterMessages(matterId: string): Promise<MatterMessage[]> {
    const listResponse = await this.request<ApiResponse<any[]>>(`/api/lawyer/chat/conversations?matterId=${matterId}`);
    if (!listResponse.success || !listResponse.data || listResponse.data.length === 0) return [];

    const convId = listResponse.data[0].id;
    const convResponse = await this.request<ApiResponse<any>>(`/api/lawyer/chat/conversations/${convId}`);
    if (!convResponse.success || !convResponse.data) throw new Error('Failed to fetch messages');
    return convResponse.data.messages;
  }

  async sendMatterMessage(matterId: string, message: string): Promise<MatterMessage> {
    const listResponse = await this.request<ApiResponse<any[]>>(`/api/lawyer/chat/conversations?matterId=${matterId}`);
    let convId;

    if (!listResponse.success || !listResponse.data || listResponse.data.length === 0) {
      const createResponse = await this.request<ApiResponse<any>>('/api/lawyer/chat/conversations', {
        method: 'POST', body: JSON.stringify({ matterId })
      });
      convId = createResponse.data.id;
    } else {
      convId = listResponse.data[0].id;
    }

    const response = await this.request<ApiResponse<any>>(
      `/api/lawyer/chat/conversations/${convId}/messages`,
      { method: 'POST', body: JSON.stringify({ message }) }
    );
    if (!response.success || !response.data) throw new Error('Failed to send message');
    return response.data.assistantMessage;
  }

  async getMatterDocuments(matterId: string): Promise<MatterDocument[]> {
    const response = await this.request<ApiResponse<MatterDocument[]>>(`/api/lawyer/matter/${matterId}/documents`);
    if (!response.success || !response.data) throw new Error('Failed to fetch documents');
    return response.data;
  }

  async uploadMatterDocument(matterId: string, file: File): Promise<MatterDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name); 
    const response = await this.request<ApiResponse<MatterDocument>>(
      `/api/lawyer/matter/${matterId}/documents`,
      { method: 'POST', body: formData }
    );
    if (!response.success || !response.data) throw new Error('Failed to upload document');
    return response.data;
  }

  async deleteMatterDocument(matterId: string, docId: string): Promise<void> {
    const response = await this.request<ApiResponse<void>>(
      `/api/lawyer/matter/${matterId}/documents/${docId}`,
      { method: 'DELETE' }
    );
    if (!response.success) throw new Error('Failed to delete document');
  }

  async getMatterDeadlines(matterId: string): Promise<MatterDeadline[]> {
    const response = await this.request<ApiResponse<any[]>>(`/api/lawyer/events?matterId=${matterId}`);
    if (!response.success || !response.data) throw new Error('Failed to fetch deadlines');
    return response.data.map((event: any) => ({
      id: event.id,
      title: event.title,
      notes: event.notes,
      day: new Date(event.dueDate).getDate().toString().padStart(2, '0'), 
      month: new Date(event.dueDate).toLocaleString('default', { month: 'short' }).toUpperCase(),
      urgency: 'normal',
      done: event.completed,
      dueDate: event.dueDate,
    }));
  }

  async addMatterDeadline(matterId: string, payload: Omit<MatterDeadline, 'id' | 'done'>): Promise<MatterDeadline> {
    const response = await this.request<ApiResponse<any>>(
      `/api/lawyer/events`,
      { method: 'POST', body: JSON.stringify({ title: payload.title, eventDate: payload.dueDate, isDeadline: true, notes: payload.notes, matterId }) }
    );
    if (!response.success || !response.data) throw new Error('Failed to add deadline');
    const event = response.data;
    return {
      id: event.id, title: event.title, notes: event.notes,
      day: new Date(event.eventDate).getDate().toString().padStart(2, '0'),
      month: new Date(event.eventDate).toLocaleString('default', { month: 'short' }).toUpperCase(),
      urgency: event.isUrgent ? 'urgent' : ((event.daysRemaining !== null && event.daysRemaining < 14) ? 'high' : 'normal'),
      done: event.status === 'COMPLETED', dueDate: event.eventDate
    };
  }

  async toggleMatterDeadline(matterId: string, deadlineId: string, done: boolean): Promise<MatterDeadline> {
    const response = await this.request<ApiResponse<any>>(
      `/api/lawyer/events/${deadlineId}`,
      { method: 'PATCH', body: JSON.stringify({ completed: done }) }
    );
    if (!response.success || !response.data) throw new Error('Failed to update deadline');
    const event = response.data;
    return {
      id: event.id, title: event.title, notes: event.notes,
      day: new Date(event.eventDate).getDate().toString().padStart(2, '0'),
      month: new Date(event.eventDate).toLocaleString('default', { month: 'short' }).toUpperCase(),
      urgency: event.isUrgent ? 'urgent' : ((event.daysRemaining !== null && event.daysRemaining < 14) ? 'high' : 'normal'),
      done: event.status === 'COMPLETED', dueDate: event.eventDate
    };
  }

  async getMatterMemory(matterId: string): Promise<WorkspaceMemory> {
    const response = await this.request<ApiResponse<WorkspaceMemory>>(`/api/lawyer/matter/${matterId}/memory`);
    if (!response.success || !response.data) throw new Error('Failed to fetch workspace memory');
    return response.data;
  }

  async updateMatterMemory(matterId: string, payload: Partial<WorkspaceMemory>): Promise<WorkspaceMemory> {
    const response = await this.request<ApiResponse<WorkspaceMemory>>(
      `/api/lawyer/matter/${matterId}/memory`,
      { method: 'PATCH', body: JSON.stringify(payload) }
    );
    if (!response.success || !response.data) throw new Error('Failed to update workspace memory');
    return response.data;
  }

  async regenerateMatterMemory(matterId: string): Promise<void> {
    const response = await this.request<ApiResponse<any>>(
      `/api/lawyer/matter/${matterId}/memory/regenerate`,
      { method: 'POST' }
    );
    if (!response.success) throw new Error('Failed to trigger memory regeneration');
  }

    async getUpcomingDeadlines(daysAhead: number = 30): Promise<any[]> {
    const response = await this.request<ApiResponse<any[]>>(
      `/api/lawyer/deadlines?daysAhead=${daysAhead}`
    );
    if (!response.success || !response.data) return [];
    return response.data;
  }

  async getMatterDocumentsFull(matterId: string): Promise<any[]> {
    const response = await this.request<ApiResponse<any[]>>(
      `/api/lawyer/documents?matterId=${matterId}`
    );
    if (!response.success || !response.data) return [];
    return response.data;
  }

  async getMatters(): Promise<Matter[]> {
    const response = await this.request<ApiResponse<any>>('/api/lawyer/matter');
    if (!response.success || !response.data) return [];
    if (Array.isArray(response.data)) return response.data;
    if (response.data.matters && Array.isArray(response.data.matters)) return response.data.matters;
    if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  }
}

export const apiService = new ApiService();
export type {
  UserProfile, Conversation, Message, SendMessageResponse, Translation, UserStats,
  Document, TemplateField, TemplateSchema, GenerateDocumentResult,
  Matter, CreateMatterPayload, MatterParty,
};