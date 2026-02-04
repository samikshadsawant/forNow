import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fpPromise;

export async function getDeviceId() {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }

  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
}
