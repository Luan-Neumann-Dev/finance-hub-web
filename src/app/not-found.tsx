import { Home, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mb-6">
          <SearchX className="w-10 h-10 text-muted-foreground" />
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <p className="text-lg font-medium text-foreground mb-1">Página não encontrada</p>
        <p className="text-muted-foreground mb-8">A página quie você está procurando não existe ou foi movida.</p>

        <Link
          href={'/dashboard'}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Home className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}