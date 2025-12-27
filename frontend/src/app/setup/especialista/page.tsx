'use client'

import React, { useActionState, useEffect, useState } from 'react'
import { salvarDadosEspecialista, getSpecialistData } from './actions'
import styles from './page.module.css'

const initialState = {
    error: '',
    success: false
}

export default function SpecialistPage() {
    const [state, formAction, isPending] = useActionState(salvarDadosEspecialista, initialState)

    // Local state para inputs (permite pre-fill)
    const [nome, setNome] = useState('')
    const [nicho, setNicho] = useState('')

    useEffect(() => {
        // Carrega dados salvos ao abrir a tela
        getSpecialistData().then(data => {
            if (data.nome) setNome(data.nome)
            if (data.nicho) setNicho(data.nicho)
        })
    }, [])

    return (
        <div className={styles.container}>
            <form action={formAction} className={styles.card}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Bem-vindo, Especialista</h1>
                    <p className={styles.subtitle}>Vamos definir a identidade do seu negócio.</p>
                </header>

                {state.success && (
                    <div className={styles.success}>
                        Dados salvos com sucesso! Pode avançar.
                    </div>
                )}

                <div className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>Como você quer ser chamado?</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Ex: Tiago Gladstone"
                            className={`input-field ${styles.input}`}
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="niche" className={styles.label}>Qual o seu nicho de atuação?</label>
                        <input
                            type="text"
                            id="niche"
                            name="niche"
                            placeholder="Ex: Marketing Digital, Finanças..."
                            className={`input-field ${styles.input}`}
                            value={nicho}
                            onChange={(e) => setNicho(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={`primary-button ${styles.button}`} disabled={isPending}>
                            {isPending ? 'Salvando...' : 'Continuar Configuração'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
