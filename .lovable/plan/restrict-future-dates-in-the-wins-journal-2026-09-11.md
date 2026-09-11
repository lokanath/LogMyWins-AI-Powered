# Restrict future dates in the Wins Journal

## Goal
Prevent users from logging a win with a future date. If they try, show the warning message: **"Future date selections are not allowed."**

## Changes (single file: `src/routes/index.tsx`)

1. **Submit validation** — In `handleSubmit`, before calling the mutation, compare the selected `date` to today's date (both as `yyyy-MM-dd` via `date-fns`). If the selected date is after today, call `toast.warning("Future date selections are not allowed.")` and `return` without saving.

2. **Date input guard** — Add a `max` attribute to the date `<input>` set to today's date (`format(new Date(), "yyyy-MM-dd")`) so the native picker greys out future dates. This is a usability aid; the submit-time check remains the authoritative guard (the native picker can still be bypassed by typing).

## Non-goals
- No server-side/database changes (the warning is client-presented; the RLS-backed table already restricts by user).
- No changes to existing fields, styling, or other validation.

## Technical detail
- Uses `date-fns` (`format`, `isAfter`, `parseISO`) — already imported.
- Validation order in `handleSubmit`: empty-fields check first, then future-date check.
