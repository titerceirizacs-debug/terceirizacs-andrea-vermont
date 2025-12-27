'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './layout.module.css'

export default function SetupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const navItems = [
        {
            name: 'Identidade',
            href: '/setup/especialista',
            icon: '👤'
        },
        {
            name: 'O Cofre (Credenciais)',
            href: '/setup/credenciais',
            icon: '🔐'
        },
        {
            name: 'Catálogo de Produtos',
            href: '/setup/produtos',
            icon: '📦'
        }
    ]

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logoArea}>
                    <div className={styles.logoTitle}>Terceiriza CS</div>
                    <div className={styles.logoSubtitle}>Setup do Especialista</div>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                            >
                                <span className={styles.icon}>{item.icon}</span>
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            <main className={styles.main}>
                <div className={styles.contentWrapper}>
                    {children}
                </div>
            </main>
        </div>
    )
}
