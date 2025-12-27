'use server'

import { HotmartService } from '@/services/hotmart'
import { createClient } from '@/utils/supabaseServer'

export async function saveSubdomain(subdomain: string) {
    const supabase = await createClient()

    // Salva o subdomínio
    const { error } = await supabase
        .from('configuracoes')
        .upsert(
            { chave: 'hotmart_subdomain', valor: subdomain, descricao: 'Subdomínio Hotmart Club' },
            { onConflict: 'chave' }
        )

    if (error) throw new Error('Erro ao salvar subdomínio.')
}

export async function fetchProductsAction(subdomain: string) {
    try {
        // 1. Salva o subdomínio primeiro
        await saveSubdomain(subdomain)

        // 2. Chama o serviço (que testa a auth internamente)
        const products = await HotmartService.listProducts()

        return { success: true, products }
    } catch (error: any) {
        console.error('Erro na Action fetchProducts:', error)
        return { success: false, error: error.message || 'Erro desconhecido.' }
    }
}

export async function saveSelectedProductsAction(products: any[]) {
    const supabase = await createClient()

    // Mapeia para o formato do banco
    const dbProducts = products.map(p => ({
        id_hotmart: p.id,
        nome: p.name,
        ativo: true,
        hotmart_subdomain: 'DYNAMIC_RETRIEVE_LATER' // Simplificação por enquanto
        // Em produção, leríamos o subdominio salvo, mas para o MVP vamos focar em salvar o item
    }))

    const { error } = await supabase
        .from('produtos')
        .upsert(dbProducts, { onConflict: 'id_hotmart' })

    if (error) {
        console.error('Erro ao salvar produtos escolhidos:', error)
        return { success: false, error: 'Erro ao salvar no banco.' }
    }

    return { success: true }
}
