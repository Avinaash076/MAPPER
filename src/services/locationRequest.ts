export interface LocationRequestPort<T> {
  requestPermission: () => Promise<{ granted: boolean }>;
  servicesEnabled: () => Promise<boolean>;
  getPosition: () => Promise<T>;
}

// The port keeps permission/timeout handling testable without a physical GPS device.
export async function requestLocation<T>(
  port: LocationRequestPort<T>,
  timeoutMs = 20000,
): Promise<T> {
  if (!(await port.requestPermission()).granted)
    throw new Error('Location permission was not granted. Choose a location manually instead.');
  if (!(await port.servicesEnabled()))
    throw new Error('Location services are off. Enable them or choose a location manually.');
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      port.getPosition(),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error('Location took too long. Retry or choose a location manually.')),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
