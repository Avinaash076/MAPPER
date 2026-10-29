import { useTheme } from '../../theme/ThemeProvider';
import { View } from 'react-native';
import { ArrowRightIcon, CompassIcon } from 'phosphor-react-native';
import { space } from '../../theme/tokens';
import { Label } from './Label';
import { Panel } from './Panel';
import { Button } from './buttons';
import { useUIStyles } from './styles';

export function EmptyState({
  title,
  message,
  action,
  onAction,
}: {
  title: string;
  message: string;
  action: string;
  onAction: () => void;
}) {
  const { colors } = useTheme();
  const styles = useUIStyles();
  return (
    <Panel style={{ alignItems: 'center', paddingVertical: space.xxl, gap: space.lg }}>
      <View style={styles.emptyIcon}>
        <CompassIcon size={32} color={colors.primary} />
      </View>
      <Label size="heading" style={{ textAlign: 'center' }}>
        {title}
      </Label>
      <Label tone="textMuted" style={{ textAlign: 'center' }}>
        {message}
      </Label>
      <Button
        label={action}
        onPress={onAction}
        icon={<ArrowRightIcon color={colors.onPrimary} size={20} />}
      />
    </Panel>
  );
}
