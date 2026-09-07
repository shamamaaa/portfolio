// Thin singleton wrapper around web-haptics (https://haptics.lochie.me). It fires the iOS Taptic
// engine via the hidden <input switch> trick and navigator.vibrate on Android, and silently no-ops on
// desktop / unsupported browsers — so callers never need to feature-detect. Import `haptic` anywhere.
import { WebHaptics, type HapticInput, type TriggerOptions } from 'web-haptics'

export type { HapticInput } from 'web-haptics'

let instance: WebHaptics | null = null

function get(): WebHaptics | null {
  if (typeof window === 'undefined') return null
  if (!instance) {
    try {
      instance = new WebHaptics()
    } catch {
      instance = null
    }
  }
  return instance
}

/** Fire a haptic. `input` is a preset name (light/medium/heavy/soft/rigid/selection/success/warning/
 *  error/nudge/buzz), a duration in ms, or a custom pattern. Fire-and-forget; errors are swallowed. */
export function haptic(input?: HapticInput, options?: TriggerOptions): void {
  try {
    void get()?.trigger(input, options)
  } catch {
    /* never let a missing-haptics platform break an interaction */
  }
}
