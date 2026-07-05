# Skeleton

Unified skeleton loading placeholder.

## Purpose

- Display lightweight placeholders for loading content.
- Provide `line`, `circle`, and `card` variants.
- Use Motion tokens for shimmer timing.
- Respect system Reduce Motion by disabling shimmer.

## Example

```tsx
import { Skeleton } from '@components/Skeleton'

<Skeleton variant="line" width="70%" />
<Skeleton variant="circle" width={48} height={48} />
<Skeleton variant="card" />
```

## Props

See `types.ts`.

## Status

Implemented in Task17.
