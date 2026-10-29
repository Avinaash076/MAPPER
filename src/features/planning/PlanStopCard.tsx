import { useTheme } from '../../theme/ThemeProvider';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from 'phosphor-react-native';
import { Button, IconButton, Label, layout, Panel } from '../../components/ui';
import { space } from '../../theme/tokens';
import { useApp } from '../state/AppProvider';
import type { Place } from '../places/types';
import { formatMinutes } from './travel';

interface PlanStopCardProps {
  place: Place;
  index: number;
  stopCount: number;
  travelMinutes: number | null;
  townName: string;
}

export function PlanStopCard({
  place,
  index,
  stopCount,
  travelMinutes,
  townName,
}: PlanStopCardProps) {
  const { colors } = useTheme();
  const { dispatch } = useApp();
  return (
    <View style={layout.section}>
      {travelMinutes !== null && (
        <Label size="small" tone="textMuted">
          ↓ ~{formatMinutes(travelMinutes)} travel{' '}
          {index === 0 ? `from ${townName}` : 'from previous stop'}
        </Label>
      )}
      <Panel style={{ gap: space.md }}>
        <Label size="eyebrow" tone="accent">
          STOP {index + 1}
        </Label>
        <Label size="heading">{place.name}</Label>
        <Label size="small" tone="textMuted">
          {place.locality} · {formatMinutes(place.visitMinutes)} visit
        </Label>
        <Button
          label="View place"
          secondary
          onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
        />
        <View style={layout.between}>
          <Label size="small">Change stop order</Label>
          <View style={layout.wrap}>
            <IconButton
              label={`Move ${place.name} up`}
              disabled={index === 0}
              onPress={() => dispatch({ type: 'moveStop', id: place.id, direction: -1 })}
            >
              <ArrowUpIcon size={22} color={colors.primary} />
            </IconButton>
            <IconButton
              label={`Move ${place.name} down`}
              disabled={index === stopCount - 1}
              onPress={() => dispatch({ type: 'moveStop', id: place.id, direction: 1 })}
            >
              <ArrowDownIcon size={22} color={colors.primary} />
            </IconButton>
            <IconButton
              label={`Remove ${place.name} from plan`}
              onPress={() => dispatch({ type: 'removeStop', id: place.id })}
            >
              <TrashIcon size={22} color={colors.danger} />
            </IconButton>
          </View>
        </View>
      </Panel>
    </View>
  );
}
