'use client'

import React, { useActionState, useState, useEffect } from 'react'
import { saveCredentials, checkSavedCredentials } from './actions'
import styles from './page.module.css'

const initialState = {
    error: '',
    success: false
}

export default function CredentialsPage() {
    const [state, formAction, isPending] = useActionState(saveCredentials, initialState)

    // Status de carregamento inicial
    const [status, setStatus] = useState({ hasHotmart: false, hasMeta: false })

    useEffect(() => {
        checkSavedCredentials().then(setStatus)
    }, [])

    // Exibição de senhas
    const [showHotmartSecret, setShowHotmartSecret] = useState(false)
    const [showMetaToken, setShowMetaToken] = useState(false)

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <header className={styles.header}>
                    <h1 className={styles.title}>O Cofre Digital</h1>
                    <p className={styles.subtitle}>Insira as chaves para conectarmos suas plataformas com segurança.</p>
                </header>

                {state.success && (
                    <div className={styles.success}>
                        Chaves guardadas com sucesso! Avançando...
                    </div>
                )}

                {state.error && (
                    <div className={styles.error}>
                        {state.error}
                    </div>
                )}

                <form action={formAction} className={styles.form}>

                    {/* Seção Hotmart */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            🔥 Hotmart API
                            {status.hasHotmart && <span style={{ color: '#4ade80', fontSize: '0.8rem', marginLeft: 'auto' }}>✓ Configurado</span>}
                        </h2>

                        <div className={styles.formGroup}>
                            <label htmlFor="hotmart_client_id" className={styles.label}>Client ID</label>
                            <input
                                type="text"
                                id="hotmart_client_id"
                                name="hotmart_client_id"
                                placeholder={status.hasHotmart ? "(Salvo) ••••••••" : "Ex: a1b2c3d4-..."}
                                className={`input-field ${styles.input}`}
                                required={!status.hasHotmart}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="hotmart_client_secret" className={styles.label}>Client Secret</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type={showHotmartSecret ? "text" : "password"}
                                    id="hotmart_client_secret"
                                    name="hotmart_client_secret"
                                    placeholder={status.hasHotmart ? "(Salvo) •••••••••••••" : "•••••••••••••••••••••"}
                                    className={`input-field ${styles.input}`}
                                    required={!status.hasHotmart}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowHotmartSecret(!showHotmartSecret)}
                                    className={styles.toggleButton}
                                    title={showHotmartSecret ? "Ocultar" : "Mostrar"}
                                >
                                    {showHotmartSecret ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Seção Meta */}
                    <div className={`${styles.section} ${styles.sectionLast}`}>
                        <h2 className={styles.sectionTitle}>
                            💬 Meta WhatsApp
                            {status.hasMeta && <span style={{ color: '#4ade80', fontSize: '0.8rem', marginLeft: 'auto' }}>✓ Configurado</span>}
                        </h2>

                        <div className={styles.formGroup}>
                            <label htmlFor="meta_business_id" className={styles.label}>Business ID</label>
                            <input
                                type="text"
                                id="meta_business_id"
                                name="meta_business_id"
                                placeholder={status.hasMeta ? "(Salvo) ••••••••" : "Ex: 100200300..."}
                                className={`input-field ${styles.input}`}
                                required={!status.hasMeta}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="meta_access_token" className={styles.label}>Access Token (System User)</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type={showMetaToken ? "text" : "password"}
                                    id="meta_access_token"
                                    name="meta_access_token"
                                    placeholder={status.hasMeta ? "(Salvo) •••••••••••••" : "EAAB..."}
                                    className={`input-field ${styles.input}`}
                                    required={!status.hasMeta}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowMetaToken(!showMetaToken)}
                                    className={styles.toggleButton}
                                    title={showMetaToken ? "Ocultar" : "Mostrar"}
                                >
                                    {showMetaToken ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={`primary-button ${styles.button}`} disabled={isPending}>
                            {isPending ? 'Validando e Salvando...' : 'Salvar no Cofre'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
