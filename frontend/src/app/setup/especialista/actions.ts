'use server'

import { createClient } from '@/utils/supabaseServer'

interface ActionState {
    error?: string
    success?: boolean
}

export async function salvarDadosEspecialista(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const niche = formData.get('niche') as string

    if (!name || !niche) {
        return { error: 'Por favor, preencha todos os campos.' }
    }

    // Upsert na tabela de configurações
    const updates = [
        { chave: 'nome_especialista', valor: name, descricao: 'Nome do Especialista' },
        { chave: 'nicho_mercado', valor: niche, descricao: 'Nicho de Atuação' }
    ]

    const { error } = await supabase
        .from('configuracoes')
        .upsert(updates, { onConflict: 'chave' })

    if (error) {
        console.error('Erro Supabase:', error)
        return { error: 'Erro ao salvar dados. Tente novamente.' }
    }

    return { success: true }
}

export async function getSpecialistData() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('configuracoes')
        .select('chave, valor')
        .in('chave', ['nome_especialista', 'nicho_mercado'])

    if (!data) return {}

    return {
        nome: data.find(c => c.chave === 'nome_especialista')?.valor || '',
        nicho: data.find(c => c.chave === 'nicho_mercado')?.valor || ''
    }
}
