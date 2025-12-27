'use server'

import { createClient } from '@/utils/supabaseServer'

interface ActionState {
    error?: string
    success?: boolean
}

export async function saveCredentials(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient()

    // Hotmart
    const hotmartClientId = formData.get('hotmart_client_id') as string
    const hotmartClientSecret = formData.get('hotmart_client_secret') as string

    // Meta
    const metaBusinessId = formData.get('meta_business_id') as string
    const metaAccessToken = formData.get('meta_access_token') as string

    // Validação Simplificada: apenas checa se tem conteúdo
    // (A validação real de conexão será feita por um Worker dedicado)
    if (!hotmartClientId || !hotmartClientSecret || !metaBusinessId || !metaAccessToken) {
        return { error: 'Por favor, preencha todas as chaves de API.' }
    }

    const updates = [
        { chave: 'hotmart_client_id', valor: hotmartClientId, descricao: 'ID do Cliente Hotmart' },
        { chave: 'hotmart_client_secret', valor: hotmartClientSecret, descricao: 'Segredo do Cliente Hotmart' },
        { chave: 'meta_business_id', valor: metaBusinessId, descricao: 'ID do Business Manager Meta' },
        { chave: 'meta_whatsapp_token', valor: metaAccessToken, descricao: 'Token de Acesso WhatsApp' }
    ]

    // Upsert em Batch
    const { error } = await supabase
        .from('configuracoes')
        .upsert(updates, { onConflict: 'chave' })

    if (error) {
        console.error('Erro Supabase Credenciais:', error)
        return { error: 'Erro ao salvar credenciais. Tente novamente.' }
    }

    return { success: true }
}

export async function checkSavedCredentials() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('configuracoes')
        .select('chave')
        .in('chave', ['hotmart_client_id', 'meta_business_id'])

    if (!data) return { hasHotmart: false, hasMeta: false }

    return {
        hasHotmart: data.some(c => c.chave === 'hotmart_client_id'),
        hasMeta: data.some(c => c.chave === 'meta_business_id')
    }
}
