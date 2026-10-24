# 0017: Central styles

- Status: accepted
- Date: 2026-10-24

## Decision

Global styles live in one place, `project/src/styles/`, loaded by a single entry file, `project/src/styles.scss`. Values (colors, sizes, breakpoints) and base styles (cards, inputs, buttons) are defined there once and reused by every page and component.

```
project/src/
  styles.scss             entry point: only @use lines, no rules
  styles/
    _tokens.scss          CSS variables: colors, typography, spacing, radii,
                          shadows, motion (exists today)
    _breakpoints.scss     screen-size breakpoints, as SCSS variables and mixins
    _base.scss            reset and element defaults: body, links, focus, selection
    base/
      _buttons.scss       .button, .button-primary, .button-ghost, .button-sm
      _inputs.scss        text inputs, number inputs, selects, checkboxes, toggles
      _cards.scss         .card and its parts
      _modals.scss        modal frame used by the shared modal components
      _panels.scss        editor panel frame (header, body, resize handle)
```

## Rules

- **No raw values in components.** Colors, sizes, spacing, radii, shadows and durations come from `_tokens.scss` (`var(--...)`). Breakpoints come from `_breakpoints.scss`.
- **Base styles are global classes.** Buttons, inputs, cards, modals and panels are styled once in `styles/base/`, and components use those classes instead of restyling them.
- **Component styles stay small.** A component's own `.scss` only holds its layout and what is unique to it.
- **Breakpoints are SCSS, not CSS variables**, because CSS variables do not work inside `@media`. They are used through a mixin, for example `@include bp.below(md) { ... }`.
- The values follow the `elight-design-tokens` skill (`.claude/skills/`).

## Breakpoints

| Name | Width | Typical device |
|---|---|---|
| `sm` | 600px | phone |
| `md` | 960px | tablet, small laptop |
| `lg` | 1280px | laptop |
| `xl` | 1600px | large screen |

`sm` and `md` match the values the home page already uses.

## Current state

The app already follows part of this: `styles/_tokens.scss` holds the tokens, and `styles.scss` loads it. To complete it (app code, done by the user):

- Move the reset and element rules from `styles.scss` to `styles/_base.scss`.
- Move the button classes (`.button`, `.button-sm`, `.button-primary`, `.button-ghost`) from `pages/home/home.scss` to `styles/base/_buttons.scss`.
- Replace the hard-coded `960px` and `600px` media queries in `home.scss` with the breakpoint mixin.

## Why

- One place to change a color, a size or the look of every button.
- The editor, the projects page and the home page look like one product.
- Smaller component styles are easier to read and review.
