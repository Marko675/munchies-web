const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    'https://munchies-api.maki-marko-09.workers.dev'

function getToken(): string | null {
    try {
        const raw = localStorage.getItem('munchies-auth')
        if (!raw) return null
        const parsed = JSON.parse(raw)
        return parsed?.state?.token ?? null
    } catch {
        return null
    }
}

function headers(): HeadersInit {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = getToken()
    if (token) h['Authorization'] = `Bearer ${token}`
    return h
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Network error' }))
        const errorMessage = (body as any).error
            ? `HTTP ${res.status}: ${(body as any).error}`
            : `HTTP ${res.status}`
        throw new Error(errorMessage)
    }
    return res.json() as Promise<T>
}

export const apiClient = {
    async get<T>(path: string): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, { headers: headers() })
        return handleResponse<T>(res)
    },

    async post<T>(path: string, body: unknown): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(body),
        })
        return handleResponse<T>(res)
    },

    async put<T>(path: string, body: unknown): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(body),
        })
        return handleResponse<T>(res)
    },

    async del<T>(path: string): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            method: 'DELETE',
            headers: headers(),
        })
        return handleResponse<T>(res)
    },

    async patch<T>(path: string, body: unknown): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify(body),
        })
        return handleResponse<T>(res)
    },
}
