"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    return (
        <>
            {!isAdminPage && <Navbar />}
            <div style={{ paddingTop: '0px' }}>
                {children}
            </div>
        </>
    );
}
