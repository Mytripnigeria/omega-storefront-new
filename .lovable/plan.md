
# Fix Modal Scroll Position Restoration

## The Problem
When you close a modal, the page jumps to the top instead of returning to where you were scrolling.

**Root cause:** The `useBodyScrollLock` hook captures `window.scrollY` every time it runs. When the modal closes and the effect runs again, `scrollY` is `0` (because the body was fixed), so the original position is lost.

## The Solution
Store the scroll position in a `useRef` when the modal opens, so it persists and can be restored when the modal closes.

## Technical Details

**File to modify:** `src/hooks/useBodyScrollLock.ts`

Current broken flow:
```text
Modal opens (isLocked = true):
  - scrollY = 150 (correct)
  - Sets body.style.top = "-150px"
  
Modal closes (isLocked = false):
  - scrollY = 0 (WRONG - captured fresh, not the saved value)
  - Tries to restore to position 0
  - Page jumps to top
```

Fixed flow:
```text
Modal opens (isLocked = true):
  - scrollYRef.current = 150 (stored in ref)
  - Sets body.style.top = "-150px"
  
Modal closes (isLocked = false):
  - Uses scrollYRef.current = 150 (preserved value)
  - Restores to position 150
  - Page stays where you were
```

## Implementation Changes

**`src/hooks/useBodyScrollLock.ts`:**
- Import `useRef` from React
- Create a `scrollYRef` to store the scroll position when locking
- When locking: save `window.scrollY` to the ref, then apply fixed positioning
- When unlocking: restore scroll from the ref value, then clear the ref
- Update cleanup function to use the stored ref value

## Files to Modify
1. `src/hooks/useBodyScrollLock.ts` - Fix scroll position storage using useRef
