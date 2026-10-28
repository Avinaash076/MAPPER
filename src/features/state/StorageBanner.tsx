import { useState } from 'react';
import { useApp } from './AppProvider';
import { space } from '../../theme/tokens';
import { Notice } from '../../components/ui/Notice';
import { Panel } from '../../components/ui/Panel';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/buttons';

export function StorageBanner() {
  const { storageStatus, retryStorage, resetStorage } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  if (!['blocked', 'error'].includes(storageStatus)) return null;
  return (
    <Panel style={{ gap: space.md }}>
      <Notice warning>
        {storageStatus === 'blocked'
          ? 'Saved data could not be loaded. Your previous data has not been overwritten. Retry loads the stored version; reset starts a new local plan.'
          : 'Changes could not be saved on this device. Keep the app open and retry.'}
      </Notice>
      <Button label="Retry storage" secondary onPress={retryStorage} />
      {storageStatus === 'blocked' &&
        (confirmReset ? (
          <>
            <Label size="small">
              Reset removes this device’s saved places, preferences and day plan.
            </Label>
            <Button
              label="Confirm reset of local data"
              onPress={() => {
                resetStorage();
                setConfirmReset(false);
              }}
            />
            <Button label="Cancel" secondary onPress={() => setConfirmReset(false)} />
          </>
        ) : (
          <Button label="Reset local data…" secondary onPress={() => setConfirmReset(true)} />
        ))}
    </Panel>
  );
}
