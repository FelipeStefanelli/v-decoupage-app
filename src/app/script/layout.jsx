'use client'
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/header'), { ssr: false });

export default function ScriptLayout({children}) {
    return (
        <div>
            <Header />
            {children}
        </div>
    );
}