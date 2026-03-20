import { ApiPayload, ApiResponse } from '@/types';

/**
 * API Service for sending transaction data to the server
 */
class ApiService {
  private baseUrl: string = '';
  private apiKey: string = '';

  configure(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey || '';
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<{ data?: T; error?: string }> {
    if (!this.baseUrl) {
      return { error: 'API URL not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        ...(body && { body: JSON.stringify(body) }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send transaction data to the server
   */
  async sendTransaction(payload: ApiPayload): Promise<ApiResponse> {
    const { data, error } = await this.request<ApiResponse>('/transaction', 'POST', payload);

    if (error) {
      return {
        success: false,
        message: error,
      };
    }

    return data || { success: false, message: 'No response from server' };
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.baseUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });

      if (response.ok) {
        return { success: true, message: 'Connection successful!' };
      }

      // Try ping endpoint if health fails
      const pingResponse = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
      });

      if (pingResponse.ok) {
        return { success: true, message: 'Connection successful!' };
      }

      return {
        success: false,
        message: `Server responded with status ${response.status}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Send with retry logic
   */
  async sendWithRetry(
    payload: ApiPayload,
    maxAttempts: number = 3,
    delayMs: number = 5000
  ): Promise<ApiResponse> {
    let lastError: string = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.sendTransaction(payload);

      if (result.success) {
        return result;
      }

      lastError = result.message || 'Unknown error';

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return {
      success: false,
      message: `Failed after ${maxAttempts} attempts. Last error: ${lastError}`,
    };
  }
}

export const apiService = new ApiService();
