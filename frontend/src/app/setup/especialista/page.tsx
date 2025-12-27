'use client'

import React, { useActionState } from 'react'
import { saveSpecialistData } from './actions'
import styles from './page.module.css'

const initialState = {
    error: '',
    success: false
}

export default function SpecialistSetupPage() {
    const [state, formAction, isPending] = useActionState(saveSpecialistData, initialState)

    return (
        <div className={styles.container}>
            <div className={`glass-panel ${styles.card}`}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Bem-vindo, Especialista</h1>
                    <p className={styles.subtitle}>Vamos definir a identidade do seu negócio.</p>
                </header>

                {state.success && (
                    <div className={styles.success}>
                        Dados salvos com sucesso! Redirecionando...
                    </div>
                )}

                {state.error && (
                    <div className={styles.error}>
                        {state.error}
                    </div>
                )}

                <form action={formAction} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>Como você quer ser chamado?</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Ex: Tiago Gladstone"
                            className={`input-field ${styles.input}`}
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
                            required
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={`primary-button ${styles.button}`} disabled={isPending}>
                            {isPending ? 'Salvando...' : 'Continuar Configuração'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
