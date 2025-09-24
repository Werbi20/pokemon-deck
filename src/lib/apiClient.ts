import { auth } from './firebase'

// Cliente API com autenticação automática
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // Verificar se há token local primeiro
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('authToken')
      if (localToken) {
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localToken}`
        }
      }
    }

    // Fallback para Firebase
    const user = auth?.currentUser
    if (!user) {
      // Desenvolvimento: permitir chamadas com token mock para liberar APIs com withAuth
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      }
    }

    const token = await user.getIdToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage += ` - ${errorData.error}`
        }
      } catch {
        // Se não conseguir fazer parse do JSON, usa a mensagem padrão
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage += ` - ${errorData.error}`
        }
      } catch {
        // Se não conseguir fazer parse do JSON, usa a mensagem padrão
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage += ` - ${errorData.error}`
        }
      } catch {
        // Se não conseguir fazer parse do JSON, usa a mensagem padrão
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage += ` - ${errorData.error}`
        }
      } catch {
        // Se não conseguir fazer parse do JSON, usa a mensagem padrão
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }
}

// Instância global do cliente API
export const apiClient = new ApiClient()
