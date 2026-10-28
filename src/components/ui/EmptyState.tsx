import { View } from 'react-native';
import { ArrowRightIcon, CompassIcon } from 'phosphor-react-native';
import { colors, space } from '../../theme/tokens';
import { Label } from './Label';
import { Panel } from './Panel';
import { Button } from './buttons';
import { styles } from './styles';

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
  return (
    <Panel style={{ alignItems: 'center', paddingVertical: space.xxl, gap: space.lg }}>
      <View style={styles.emptyIcon}>
        <CompassIcon size={32} color={colors.green} />
      </View>
      <Label size="heading" style={{ textAlign: 'center' }}>
        {title}
      </Label>
      <Label tone="muted" style={{ textAlign: 'center' }}>
        {message}
      </Label>
      <Button
        label={action}
        onPress={onAction}
        icon={<ArrowRightIcon color={colors.surface} size={20} />}
      />
    </Panel>
  );
}
