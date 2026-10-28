import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XIcon } from 'phosphor-react-native';
import { useApp } from '../features/state/AppProvider';
import {
  type DiscoveryFilters,
  type Transport,
  transportLabels,
  distanceOptions,
  timeOptions,
} from '../features/places/types';
import { formatMinutes } from '../features/planning/travel';
import { Button, Chip, IconButton, Label, layout, Notice } from './ui';
import { colors, radii, space } from '../theme/tokens';
export function FilterSheet({ visible, close }: { visible: boolean; close: () => void }) {
  const { state, dispatch } = useApp();
  const [draft, setDraft] = useState<DiscoveryFilters>(state.filters);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
      accessibilityViewIsModal
    >
      <View style={styles.backdrop}>
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.sheet}>
          <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xl }}>
            <View style={layout.between}>
              <Label size="heading" accessibilityRole="header">
                Make it your kind of day
              </Label>
              <IconButton label="Close filters without applying" onPress={close}>
                <XIcon size={24} color={colors.ink} />
              </IconButton>
            </View>
            <View style={layout.section}>
              <Label>How are you getting around?</Label>
              <View style={layout.wrap}>
                {(Object.keys(transportLabels) as Transport[]).map((mode) => (
                  <Chip
                    key={mode}
                    label={transportLabels[mode]}
                    selected={draft.transport === mode}
                    onPress={() => setDraft({ ...draft, transport: mode })}
                  />
                ))}
              </View>
            </View>
            <View style={layout.section}>
              <Label>Distance from town centre</Label>
              <View style={layout.wrap}>
                {distanceOptions.map((radiusKm) => (
                  <Chip
                    key={radiusKm}
                    label={`${radiusKm} km`}
                    selected={draft.radiusKm === radiusKm}
                    onPress={() => setDraft({ ...draft, radiusKm })}
                  />
                ))}
              </View>
            </View>
            <View style={layout.section}>
              <Label>Time for the whole outing</Label>
              <View style={layout.wrap}>
                {timeOptions.map((budgetMinutes) => (
                  <Chip
                    key={budgetMinutes}
                    label={formatMinutes(budgetMinutes)}
                    selected={draft.budgetMinutes === budgetMinutes}
                    onPress={() => setDraft({ ...draft, budgetMinutes })}
                  />
                ))}
              </View>
            </View>
            <Notice>
              Distances are straight line. Sample travel estimates include a rough detour allowance,
              with no live routing or access checks. Time includes the visit and return to town.
            </Notice>
            <Label size="small" tone="muted">
              These settings also update the estimates in My plan.
            </Label>
            <Button
              label="Show places that fit"
              onPress={() => {
                dispatch({ type: 'filters', filters: draft });
                close();
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
    paddingTop: space.xxxl,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.large,
    borderTopRightRadius: radii.large,
    maxHeight: '100%',
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
});
