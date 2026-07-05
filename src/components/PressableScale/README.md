# PressableScale

Unified press feedback wrapper introduced in Task17.

## Purpose

- Provide consistent scale-down feedback for cards and icon-like touch targets.
- Run transform animation with Reanimated.
- Respect system Reduce Motion.
- Optionally trigger semantic haptic feedback via `hapticIntent`.

## Example

```tsx
import { PressableScale } from '@components/PressableScale'

;<PressableScale hapticIntent="tap" onPress={handlePress}>
  <Content />
</PressableScale>
```

## Props

See `PressableScale.tsx` for the typed props. The component extends `PressableProps` except for `style`, which is applied to the outer animated container.

## Status

Implemented in Task17.
