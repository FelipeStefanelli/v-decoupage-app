'use client'
import { VisibilityProvider } from '@/contexts/VisibilityContext';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/header'), { ssr: false });

export default function ClientLayout({ children }) {
    return (
        <VisibilityProvider>
            <div>
                <Header />
                {children}
            </div>
        </VisibilityProvider>
    );
}