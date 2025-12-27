'use server'

import { createClient } from '@/utils/supabaseServer'
import { redirect } from 'next/navigation'

interface ActionState {
    error?: string
    success?: boolean
}

export async function saveSpecialistData(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const niche = formData.get('niche') as string

    if (!name || !niche) {
        return { error: 'Preencha todos os campos obrigatórios.' }
    }

    // 1. Gravar nome
    const { error: errorName } = await supabase
        .from('configuracoes')
        .upsert({ chave: 'nome_especialista', valor: name }, { onConflict: 'chave' })

    // 2. Gravar nicho
    const { error: errorNiche } = await supabase
        .from('configuracoes')
        .upsert({ chave: 'nicho_mercado', valor: niche }, { onConflict: 'chave' })

    if (errorName || errorNiche) {
        console.error('Erro Supabase:', errorName, errorNiche)
        return { error: 'Erro ao salvar dados. Verifique sua conexão.' }
    }

    // Se tudo deu certo
    return { success: true }
}
