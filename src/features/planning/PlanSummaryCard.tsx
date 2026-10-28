import { Label, Notice, Panel } from '../../components/ui';
import { colors, space } from '../../theme/tokens';
import { formatMinutes, type PlanSummary } from './travel';

interface PlanSummaryCardProps {
  summary: PlanSummary;
  budgetMinutes: number;
}

export function PlanSummaryCard({ summary, budgetMinutes }: PlanSummaryCardProps) {
  return (
    <Panel
      style={{ gap: space.md, backgroundColor: colors.paleGreen, borderColor: colors.paleGreen }}
    >
      <Label size="eyebrow" tone="green">
        YOUR OUTING, APPROXIMATELY
      </Label>
      <Label size="title">{formatMinutes(summary.totalMinutes)}</Label>
      <Label size="small" tone="muted">
        {formatMinutes(summary.visitMinutes)} exploring + {formatMinutes(summary.travelMinutes)}{' '}
        travelling, including return
      </Label>
      {summary.overBudget ? (
        <Notice warning>
          Over your budget by {formatMinutes(summary.totalMinutes - budgetMinutes)}. Remove a stop
          or allow more time.
        </Notice>
      ) : (
        <Label size="small" tone="green">
          {formatMinutes(budgetMinutes - summary.totalMinutes)} left in your time budget
        </Label>
      )}
    </Panel>
  );
}
