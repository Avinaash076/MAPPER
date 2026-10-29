import { useTheme } from '../../theme/ThemeProvider';
import { Label, Notice, Panel } from '../../components/ui';
import { space } from '../../theme/tokens';
import { formatMinutes, type PlanSummary } from './travel';

interface PlanSummaryCardProps {
  summary: PlanSummary;
  budgetMinutes: number;
}

export function PlanSummaryCard({ summary, budgetMinutes }: PlanSummaryCardProps) {
  const { colors } = useTheme();
  return (
    <Panel
      style={{
        gap: space.md,
        backgroundColor: colors.primarySoft,
        borderColor: colors.primarySoft,
      }}
    >
      <Label size="eyebrow" tone="primary">
        YOUR OUTING, APPROXIMATELY
      </Label>
      <Label size="title">{formatMinutes(summary.totalMinutes)}</Label>
      <Label size="small" tone="textMuted">
        {formatMinutes(summary.visitMinutes)} exploring + {formatMinutes(summary.travelMinutes)}{' '}
        travelling, including return
      </Label>
      {summary.overBudget ? (
        <Notice warning>
          Over your budget by {formatMinutes(summary.totalMinutes - budgetMinutes)}. Remove a stop
          or allow more time.
        </Notice>
      ) : (
        <Label size="small" tone="primary">
          {formatMinutes(budgetMinutes - summary.totalMinutes)} left in your time budget
        </Label>
      )}
    </Panel>
  );
}
