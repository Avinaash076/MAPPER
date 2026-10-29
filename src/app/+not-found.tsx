import { router } from 'expo-router';
import { EmptyState, Screen } from '../components/ui';
export default function NotFound() {
  return (
    <Screen>
      <EmptyState
        title="A little off the trail"
        message="This screen could not be found. Head back to nearby places."
        action="Back to Discover"
        onAction={() => router.replace('/discover')}
      />
    </Screen>
  );
}
