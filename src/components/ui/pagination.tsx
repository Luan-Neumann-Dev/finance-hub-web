import { cn } from "@/lib/utils";
import { PaginationMeta } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagianation({ meta, onPageChange, disabled }: PaginationProps) {
  const { page, totalPages, total, hasPreviousPage, hasNextPage } = meta;

  if (totalPages <= 1) return null;

  function getPages(): (number | "...")[] {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);

    if (page > 3) pages.push("...");

    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }

    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="flex flex-col sm:flew-row items-center justify-between gap-3 pt-4 border-t border-border">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Exibindo página{" "}
        <span className="font-medium text-foreground">{page}</span> de{" "}
        <span className="font-medium text-foreground">{totalPages}</span>{" "}
        &middot; <span className="font-medium text-foreground">{total}</span>{" "}
        {total === 1 ? "despesa" : "despesas"} no total
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage || disabled}
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center transition-colors text-sm font-medium",
            "disabled:pointer-events-none disabled:opacity-40",
            "hover:bg-muted text-muted-foreground hover:text-foreground",
          )}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPages().map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="h-9 w-9 flex items-center justify-center text-muted-foreground text-sm"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={disabled}
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center text-sm font-medium transition-colors",
                "disabled:pointer-events-none",
                p === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
              aria-label={`Página ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}
        
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || disabled}
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center transition-colors text-sm font-medium",
            "disabled:pointer-events-none disabled:opacity-40",
            "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
