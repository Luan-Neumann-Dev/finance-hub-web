import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }){
    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
            {children}
        </main>
    )
}