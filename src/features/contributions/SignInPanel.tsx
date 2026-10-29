import { useEffect, useState } from 'react';
import { communityClient } from '../../services/communityClient';
import { Button, Field, Label, Notice, Panel, layout } from '../../components/ui';

export function SignInPanel() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!communityClient) return;
    const { data } = communityClient.auth.onAuthStateChange((_event, session) =>
      setSignedIn(Boolean(session)),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  async function sendCode() {
    if (!communityClient) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await communityClient.auth.signInWithOtp({ email: email.trim() });
      if (result.error) throw result.error;
      setSent(true);
      setMessage('Check your email for the sign-in code.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The sign-in code could not be sent.');
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    if (!communityClient) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await communityClient.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email',
      });
      if (result.error) throw result.error;
      setSignedIn(true);
      setToken('');
    } catch {
      setMessage('The code could not be verified. Check it or request a new one.');
    } finally {
      setBusy(false);
    }
  }
  if (!communityClient)
    return (
      <Notice>
        Community sharing is not connected yet. You can create, photograph and save private place
        drafts now.
      </Notice>
    );
  return (
    <Panel style={layout.section}>
      <Label size="heading">
        {signedIn ? 'Ready to send for review' : 'Sign in to share with the community'}
      </Label>
      {signedIn ? (
        <Button
          label="Sign out"
          secondary
          onPress={() => {
            void communityClient!.auth
              .signOut()
              .catch(() => setMessage('Sign-out failed. Please retry.'));
          }}
        />
      ) : (
        <>
          <Label size="small" tone="textMuted">
            Browsing and private drafts do not need an account.
          </Label>
          <Field
            accessibilityLabel="Email address for contributor sign in"
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <Button
            label={busy ? 'Please wait…' : sent ? 'Send a new code' : 'Email me a code'}
            secondary
            disabled={busy || !email.includes('@')}
            onPress={() => {
              void sendCode();
            }}
          />
          {sent && (
            <>
              <Field
                accessibilityLabel="Email sign-in code"
                placeholder="Sign-in code"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                value={token}
                onChangeText={setToken}
              />
              <Button
                label="Verify code"
                disabled={busy || !token.trim()}
                onPress={() => {
                  void verify();
                }}
              />
            </>
          )}
        </>
      )}
      {message ? (
        <Label size="small" accessibilityLiveRegion="polite">
          {message}
        </Label>
      ) : null}
    </Panel>
  );
}
