
# Fix Location Modal Desktop Positioning and Scroll Restoration

## Problems Identified

### Problem 1: Desktop Modal Not Centered
The desktop Location modal uses CSS transforms (`-translate-x-1/2 -translate-y-1/2`) for centering, but these conflict with Framer Motion's scale animation since both use the `transform` property.

### Problem 2: Page Scrolls to Top When Modal Opens
When the modal opens, the body gets `position: fixed` which visually jumps to the top. The negative `top` offset should counter this, but users are experiencing the jump.

## Solutions

### Fix 1: Desktop Modal Centering
Use a flexbox wrapper for centering instead of CSS transforms on the animated element. This separates the centering logic from the animation.

**Changes to `src/components/LocationSheet.tsx`:**
- Wrap the desktop modal in a centering container using `flex items-center justify-center`
- Remove `translate` classes from the motion.div
- Keep the scale animation on the inner element

### Fix 2: Scroll Position Restoration
Improve the `useBodyScrollLock` hook to ensure scroll position is captured before any layout changes occur, and restored correctly when the modal closes.

**Changes to `src/hooks/useBodyScrollLock.ts`:**
- Only store scroll position when transitioning from unlocked to locked (not on every render where isLocked is true)
- Use `requestAnimationFrame` to ensure scroll restoration happens after layout is complete
- Add a small delay to ensure the body styles are fully cleared before restoring scroll

## Technical Details

### Desktop Modal Structure (after fix)
```text
<div className="fixed inset-0 flex items-center justify-center">  <-- Centering wrapper
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-card rounded-2xl w-full max-w-lg"              <-- No translate classes
  >
    {content}
  </motion.div>
</div>
```

### Scroll Lock Flow (after fix)
```text
Modal opens (isLocked changes from false to true):
  - Capture window.scrollY immediately
  - Apply body.style.top with negative offset
  - Add modal-open class

Modal closes (isLocked changes from true to false):
  - Remove modal-open class
  - Clear body.style.top
  - Use requestAnimationFrame to restore scroll after layout settles
```

## Files to Modify

1. **`src/components/LocationSheet.tsx`**
   - Add centering wrapper for desktop dialog
   - Remove transform classes from the motion.div
   - Keep scale animation intact

2. **`src/hooks/useBodyScrollLock.ts`**
   - Add ref to track previous locked state
   - Only capture scroll when transitioning to locked
   - Use requestAnimationFrame for scroll restoration

3. **`src/components/CartSheet.tsx`** (apply same pattern for consistency)
   - Use separate mobile and desktop motion.div elements
   - Add centering wrapper for desktop version
