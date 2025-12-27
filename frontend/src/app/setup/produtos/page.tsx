'use client'

import React, { useState } from 'react'
import { fetchProductsAction, saveSelectedProductsAction, getSubdomain } from './actions'
import styles from './page.module.css'

interface Product {
    id: number
    name: string
    ucode: string
    active: boolean
}

export default function ProductsPage() {
    const [subdomain, setSubdomain] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        getSubdomain().then(val => {
            if (val) setSubdomain(val)
        })
    }, [])

    const handleSearch = async () => {
        if (!subdomain) return
        setLoading(true)
        setError('')
        setProducts([])

        const result = await fetchProductsAction(subdomain)

        if (result.success && result.products) {
            setProducts(result.products)
            // Auto-select active products by default
            // setSelectedIds(result.products.map(p => p.id)) 
        } else {
            setError(result.error || 'Erro ao buscar produtos.')
        }
        setLoading(false)
    }

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(pId => pId !== id)
                : [...prev, id]
        )
    }

    const handleSave = async () => {
        if (selectedIds.length === 0) return
        setSaving(true)

        const selectedProducts = products.filter(p => selectedIds.includes(p.id))
        const result = await saveSelectedProductsAction(selectedProducts)

        if (result.success) {
            alert('Produtos salvos e ativados no CRM!')
            // Redirect or Next Step logic here
        } else {
            alert('Erro ao salvar: ' + result.error)
        }
        setSaving(false)
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Catálogo de Produtos</h1>
                <p className={styles.subtitle}>Conecte sua conta Hotmart e escolha os produtos para gerenciar.</p>
            </header>

            {/* Step 1: Config & Connect */}
            <div className={styles.configSection}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Subdomínio Hotmart Club</label>
                    <input
                        type="text"
                        placeholder="Ex: cursodev (sem .club.hotmart.com)"
                        className={styles.input}
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value)}
                    />
                </div>
                <button
                    className={styles.searchButton}
                    onClick={handleSearch}
                    disabled={loading || !subdomain}
                >
                    {loading ? 'Conectando...' : 'Buscar Produtos'}
                </button>
            </div>

            {error && (
                <div className={styles.errorBox}>
                    <strong>Falha na Conexão:</strong> {error}
                    <br />
                    <small>Verifique se suas credenciais na Tela 02 estão corretas.</small>
                </div>
            )}

            {/* Step 2: List Results */}
            {products.length > 0 && (
                <div className={styles.resultsArea}>
                    <h2 className={styles.resultsTitle}>Encontrados ({products.length})</h2>

                    <div className={styles.grid}>
                        {products.map(product => {
                            const isSelected = selectedIds.includes(product.id)
                            return (
                                <div
                                    key={product.id}
                                    className={`${styles.productCard} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => toggleSelection(product.id)}
                                >
                                    <div className={styles.cardHeader}>
                                        <span className={styles.productId}>ID: {product.id}</span>
                                        {isSelected && <span className={styles.checkIcon}>✓</span>}
                                    </div>
                                    <h3 className={styles.productName}>{product.name}</h3>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Floating Action Button for Save */}
            {selectedIds.length > 0 && (
                <button className={styles.fab} onClick={handleSave} disabled={saving}>
                    {saving ? 'Configurando...' : `Importar ${selectedIds.length} Produto(s)`}
                    <span>➔</span>
                </button>
            )}

            {!loading && products.length === 0 && !error && (
                <div className={styles.emptyState}>
                    Insira seu subdomínio acima para iniciar a busca.
                </div>
            )}
        </div>
    )
}
