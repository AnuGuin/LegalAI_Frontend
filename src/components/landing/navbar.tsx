'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import CardNav from '@/components/ui/CardNav'
import { Logo } from '@/components/ui/logo'

export const Navbar = ({ animate = false }: { animate?: boolean }) => {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="h-[60px]" />
    }

    const isDark = resolvedTheme === 'dark'

    const items = [
        {
            label: 'Platform Overview',
            bgColor: isDark ? '#2d3039ff' : '#f8fafc',
            textColor: isDark ? '#f8fafc' : '#0f172a',
            links: [
                { label: 'System Overview', href: '#home', ariaLabel: 'Go to overview' },
                { label: 'Core Capabilities', href: '#features', ariaLabel: 'Go to capabilities section' },
            ],
        },
        {
            label: 'Billing & Info',
            bgColor: isDark ? '#2d3039ff' : '#f8fafc',
            textColor: isDark ? '#f8fafc' : '#0f172a',
            links: [
                { label: 'Calibrated Pricing', href: '#pricing', ariaLabel: 'Go to pricing section' },
                { label: 'Common Queries', href: '#faq', ariaLabel: 'Go to FAQ section' },
            ],
        },
        {
            label: 'Client Access',
            bgColor: isDark ? '#2d3039ff' : '#f8fafc',
            textColor: isDark ? '#f8fafc' : '#0f172a',
            links: [
                { label: 'Console Login', href: '/auth/citizen?action=login', ariaLabel: 'Login to console' },
                { label: 'Request Access', href: '/auth/citizen?action=register', ariaLabel: 'Request platform access' },
            ],
        },
    ]

    return (
        <CardNav
            logo={<Logo showText={true} variant="sidebar" className="!gap-1.5" />}
            logoAlt="LegalAI"
            items={items}
            className="!fixed pointer-events-auto"
            baseColor={isDark ? '#121318' : '#ffffff'}
            menuColor={isDark ? '#f8fafc' : '#0f172a'}
            buttonBgColor={isDark ? '#3b4ff8' : '#1d4ed8'}
            buttonTextColor="#ffffff"
            ease="power3.out"
            theme={isDark ? 'dark' : 'light'}
            ctaHref="/auth"
            animate={animate}
        />
    )
}