

# Fix Dark Mode Toggle

## The Problem
The dark mode toggle isn't working because of two issues:
1. There's a leftover `theme-red` class on the HTML element in `index.html` that isn't being managed by the theme system
2. The theme context only removes `light` and `dark` classes but doesn't clean up other theme-related classes

## The Solution

### Step 1: Clean up index.html
Remove the unused `theme-red` class from the HTML element since it's not defined anywhere in the CSS and may cause confusion.

**File: `index.html`**
- Change `<html lang="en" class="theme-red">` to `<html lang="en">`

### Step 2: Update ThemeContext to be more robust
Modify the theme context to also remove any stray theme classes and ensure the dark class is properly applied.

**File: `src/context/ThemeContext.tsx`**
- Update the `useEffect` to remove additional potential theme classes
- Add a more comprehensive class cleanup

## Technical Details

```text
Current flow:
index.html: <html class="theme-red">
     ↓
ThemeContext adds "dark" class
     ↓
Result: <html class="theme-red dark">
     ↓
CSS variables may not apply correctly due to leftover class

Fixed flow:
index.html: <html>
     ↓
ThemeContext adds "dark" or "light" class
     ↓
Result: <html class="dark"> or <html class="light">
     ↓
CSS variables apply correctly
```

## Files to Modify
1. `index.html` - Remove the `theme-red` class
2. `src/context/ThemeContext.tsx` - Add cleanup for any stray theme classes

