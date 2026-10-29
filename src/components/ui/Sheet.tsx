import type { PropsWithChildren } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XIcon } from 'phosphor-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../theme/useReducedMotion';
import { radii, space } from '../../theme/tokens';
import { IconButton } from './buttons';
import { Label } from './Label';
import { layout } from './layout';

interface SheetProps {
  title: string;
  onClose: () => void;
}

export function Sheet({ title, onClose, children }: PropsWithChildren<SheetProps>) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  return (
    <Modal
      transparent
      visible
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: '#00000088',
          paddingTop: space.xxxl,
        }}
      >
        <SafeAreaView
          edges={['bottom', 'left', 'right']}
          accessibilityViewIsModal
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radii.large,
            borderTopRightRadius: radii.large,
            maxHeight: '100%',
            width: '100%',
            maxWidth: 720,
            alignSelf: 'center',
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: space.xl, gap: space.xl }}
          >
            <View style={layout.between}>
              <Label size="heading" accessibilityRole="header" style={{ flex: 1 }}>
                {title}
              </Label>
              <IconButton label={`Close ${title}`} onPress={onClose}>
                <XIcon size={24} color={colors.text} />
              </IconButton>
            </View>
            {children}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
