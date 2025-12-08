import { API_BASE_URL } from "./env"
import { getToken } from "./storage"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

// Cliente HTTP centralizado para chamadas à API backend.
interface RequestOptions extends RequestInit {
    // Corpo tipado para JSON automaticamente.
    body?: any
    // Se true, não adiciona Authorization mesmo com token.
    skipAuth?: boolean
}

// Cria URL
function buildUrl(path: string) {
  const base = API_BASE_URL.replace(/\/+$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalizedPath}`
}

async function requestJson<TResponse>(
    path: string,
    method: HttpMethod,
    options: RequestOptions = {},
): Promise<TResponse> {
    // Monta URL completa juntando base da API + path relativo.
    const url = buildUrl(path)

    // Usa Record<string, string> para facilitar manipulação de headers.
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> | undefined),
    }

    // Injeta Authorization: Bearer token se existir e não estiver desabilitado.
    const token = getToken()
    if (token && !options.skipAuth) {
        headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url, {
        ...options,
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    })

    // Se não for 2xx, tenta extrair mensagem de erro.
    if (!response.ok) {
        const text = await response.text().catch(() => "")
        let message = `HTTP error ${response.status}`

        // Tenta extrair message do JSON se vier.
        try {
            const data = JSON.parse(text)
            if (data?.message) {
                message = Array.isArray(data.message) ? data.message.join(", ") : data.message
            }
        } catch {
            // ignora erro de parse e usa mensagem padrão.
        }

        throw new Error(message)
    }

    const contentType = response.headers.get("Content-Type") ?? ""
    if (!contentType.includes("application/json")) {
        throw new Error("Resposta da API não é JSON")
    }

    // Faz parse do JSON e retorna tipado como TResponse.
    return (await response.json()) as TResponse
}

async function requestBlob(
    path: string,
    method: HttpMethod,
    options: RequestOptions = {},
): Promise<Blob> {
    // Monta URL completa para endpoints que retornam arquivos.
    const url = `${API_BASE_URL}${path}`

    // Usa Record<string, string> para facilitar manipulação de headers.
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> | undefined),
    }

    // Injeta Authorization se houver token (export também é protegido).
    const token = getToken()
    if (token && !options.skipAuth) {
        headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url, {
        ...options,
        method,
        headers,
    })

    // Se não for 2xx, converte body para texto e lança erro.
    if (!response.ok) {
        const text = await response.text().catch(() => "")
        let message = `HTTP error ${response.status}`
        if (text) {
            message = text
        }
        throw new Error(message)
    }

    // Retorna o corpo como Blob (arquivo para download).
    return await response.blob()
}

// Métodos convenientes para uso.
export const apiClient = {
    // GET que espera JSON na resposta.
    get: <TResponse>(path: string, options?: RequestOptions) =>
        requestJson<TResponse>(path, "GET", options),

    // POST que envia JSON no body e espera JSON na resposta.
    post: <TResponse>(path: string, body?: any, options?: RequestOptions) =>
        requestJson<TResponse>(path, "POST", { ...options, body }),

    // PUT que envia JSON no body.
    put: <TResponse>(path: string, body?: any, options?: RequestOptions) =>
        requestJson<TResponse>(path, "PUT", { ...options, body }),

    // PATCH que envia JSON no body.
    patch: <TResponse>(path: string, body?: any, options?: RequestOptions) =>
        requestJson<TResponse>(path, "PATCH", { ...options, body }),

    // DELETE que espera JSON na resposta (se houver).
    delete: <TResponse>(path: string, options?: RequestOptions) =>
        requestJson<TResponse>(path, "DELETE", options),

    // GET específico para download de arquivos (CSV/XLSX).
    getBlob: (path: string, options?: RequestOptions) =>
        requestBlob(path, "GET", options),
}