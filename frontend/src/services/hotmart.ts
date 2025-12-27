import { createClient } from '@/utils/supabaseServer'

interface HotmartToken {
    access_token: string
    expires_in: number
}

interface HotmartProduct {
    id: number
    name: string
    ucode: string
    active: boolean
}

export class HotmartService {
    private static AUTH_URL = 'https://api-sec-vlc.hotmart.com/security/oauth/token'
    private static BASE_URL = 'https://developers.hotmart.com/payments/api/v1'

    // Busca credenciais do banco e gera token
    static async getAccessToken(): Promise<string> {
        const supabase = await createClient()

        // 1. Buscar credenciais
        const { data: configs, error } = await supabase
            .from('configuracoes')
            .select('chave, valor')
            .in('chave', ['hotmart_client_id', 'hotmart_client_secret'])

        if (error || !configs) throw new Error('Erro ao ler configurações do banco.')

        const clientId = configs.find(c => c.chave === 'hotmart_client_id')?.valor
        const clientSecret = configs.find(c => c.chave === 'hotmart_client_secret')?.valor

        if (!clientId || !clientSecret) {
            throw new Error('Credenciais da Hotmart não encontradas. Configure na Tela 02.')
        }

        // 2. Chamar API de Auth
        const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

        const response = await fetch(`${this.AUTH_URL}?grant_type=client_credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            console.error('Erro Auth Hotmart:', await response.text())
            throw new Error('Falha na autenticação com a Hotmart. Verifique Client ID e Secret.')
        }

        const data: HotmartToken = await response.json()
        return data.access_token
    }

    // Lista produtos da conta
    static async listProducts(): Promise<HotmartProduct[]> {
        const token = await this.getAccessToken()

        const response = await fetch(`${this.BASE_URL}/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            next: { revalidate: 0 }
        })

        // Debug: Ler como texto primeiro para ver o que realmente voltou
        const responseText = await response.text()

        if (!response.ok) {
            console.error('Erro API Hotmart Produtos:', response.status, responseText)
            throw new Error(`Falha Hotmart (${response.status}): ${responseText || 'Sem mensagem'}`)
        }

        if (!responseText) {
            console.warn('API Hotmart retornou corpo vazio.')
            return []
        }

        try {
            const json = JSON.parse(responseText)
            // Hotmart retorna { data: { items: [...] } } ou { items: [...] }
            // A estrutura real costuma ser paginada: { items: [...], page_info: {...} }
            const items = json.items || (json.data && json.data.items) || json.data || []

            return items.map((item: any) => ({
                id: item.id,
                name: item.name,
                ucode: item.ucode,
                active: item.active
            }))
        } catch (e) {
            console.error('Erro ao parsear JSON Hotmart:', e, 'Response:', responseText)
            throw new Error('A resposta da Hotmart não é um JSON válido.')
        }
    }
}
