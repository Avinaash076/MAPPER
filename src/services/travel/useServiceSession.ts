import { useEffect, useState } from 'react';
import { communityClient } from '../communityClient';

export function useServiceSession() {
  const [accountId, setAccountId] = useState<string | null>(null);
  useEffect(() => {
    if (!communityClient) return;
    let active = true;
    const { data } = communityClient.auth.onAuthStateChange((_event, session) => {
      if (active) setAccountId(session?.user.id ?? null);
    });
    void communityClient.auth
      .getSession()
      .then(({ data }) => {
        if (active) setAccountId(data.session?.user.id ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return accountId;
}
