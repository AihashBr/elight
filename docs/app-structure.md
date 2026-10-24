# App structure

Folder conventions for the Angular app in `project/src/app/`. This is documentation only: the app code is written by the user.

```
project/src/app/
  components/       components used by the whole app
    messages/       alert, error, success and confirmation messages
    loading/        generic loading modal, used everywhere
  services/         services used by the whole app, including the
                    services that wrap external libraries (decision 0008)
  pages/
    <page>/         one folder per route page
      components/   components used only by this page
      services/     services of this page
```

## Rules

- A component used by more than one page goes in `app/components/`.
- A component used by one page goes in that page's `components/` folder.
- Every component keeps its core logic in a service; components talk to each other through services.
- Inside a `services/` folder, one file per service (for example `world-editor.service.ts`), no subfolders.
- External libraries (Three.js and others) are never used directly; each one is wrapped by a service in `app/services/` (decision 0008).

## Styles

Global styles are centralized in `project/src/styles/` and loaded by `project/src/styles.scss`: tokens (colors, sizes), breakpoints, base element styles, and base classes for buttons, inputs, cards, modals and panels. Components use them and keep only their own layout. See `docs/decisions/0017-central-styles.md`.

## Shared components

### Messages

Shows a message to the user. Kinds:

| Kind | Use |
|---|---|
| Alert | Warn about something that needs attention. |
| Error | Something failed (for example, a project ID that does not exist). |
| Success | An action finished (for example, a project was created). |
| Confirmation | Ask before an action (for example, deleting a project); the user confirms or cancels. |

### Loading modal

A single, generic loading modal. Every place that waits on something long (creating a project, downloading the AI model, loading a scene, importing a zip) uses it; no page builds its own.

| Option | Description |
|---|---|
| `title` | What is happening (for example "Creating project"). |
| `message` | Optional extra text (for example a warning that it may take a while). |
| `progress` | 0 to 100 for a progress bar; empty for an indeterminate spinner. |
| `detail` | Optional detail line (for example "350 MB of 1.2 GB"). |
| `cancelable` | Shows a "Cancel" button when the task can be stopped. |

It is driven by a loading service (`app/services/`): any service opens it, updates its progress and closes it. Only one loading modal is shown at a time.

## Notes

- Existing pages follow the convention too: the home page's background component moves from `pages/home/background/` to `pages/home/components/background/` (to be done by the user).
