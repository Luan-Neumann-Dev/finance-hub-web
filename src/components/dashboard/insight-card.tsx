import { TrendingUp, TrendingDown, Lightbulb, AlertCircle, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  text: string;
  type: 'positive' | 'negative' | 'neutral' | 'info'
}

interface InsightCardProps {
  insights: Insight[];
}

const iconMap = {
  positive: <TrendingDown className="w-4 h-4 text-success" />,
  negative: <AlertCircle className="w-4 h-4 text-destructive" />,
  neutral: <TrendingUp className="w-4 h-4 text-primary" />,
  info: <Lightbulb className="w-4 h-4 text-primary" />
};

const bgMap = {
  positive: 'bg-success/5 border-success/20',
  negative: 'bg-destructive/5 border-destructive/20',
  neutral: 'bg-primary/5 border-primary/20',
  info: 'bg-muted/50 border-border'
}

export function InsightCard({ insights }: InsightCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Insights</h3>
      </div>
      {insights.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
          <PiggyBank className="w-10 h-10 opacity-30" />
          <p className="text-sm text-center">Adicione receitas e despesas <br />para gerar insights personalizados.</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {insights.map((insight, i) => (
            <div key={i} className={cn('flex items-start gap-3 p-3 rounded-xl border', bgMap[insight.type])}>
              <div className="mt-0.5 shrink-0">{iconMap[insight.type]}</div>
              <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}