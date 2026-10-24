# 0011: Object attributes

- Status: accepted
- Date: 2026-10-24

## Decision

Behavior is split into **attributes**: small classes that are attached to an object. An object class (decision 0006) does not hold all the code itself; it receives attributes such as movement or inventory.

Example: a `player` object with the `movement` and `inventory` attributes, instead of one large player class.

Every attribute class extends the base attribute class `GameAttribute`, provided by the engine, and follows its contract.

```
/projects/
  <id>/
    attributes/
      movement.js
      inventory.js
      ...           created by the user or the AI
```

## Rules

- One class per file. Scenes refer to the class by its file ID (decision 0013); people, the terminal, the AI and code use its path inside `attributes/`, without the extension (for example `movement`). Subfolders are allowed for grouping.
- Attributes do not draw: they have no `onRender`. Only the object draws (decision 0006). An attribute changes what the object does, not what it shows.
- An object class can declare default attributes with an optional `static attributes = ['movement']`. They are added when the object is created, are saved in the scene like any other attribute, and the user can remove them.
- Attributes are added to an object by the user in the editor, from the properties panel: an "Add attribute" button opens a selection modal that works like the "Add object" modal (it reads the structure of `attributes/` and has a search bar).
- An object can have several attributes, but only one of each type.
- The name "attributes" is used instead of "components" to avoid confusion with Angular components.

## Base attribute contract

Static information each class declares:

| Item | Description |
|---|---|
| `label` | Name shown in the "Add attribute" modal and in the properties panel. Required. |
| `properties` | Same format as object properties (decision 0006): `name`, `label`, `type`, `default`, `info` and the type-specific keys. |
| `requires` | Other attribute types this one needs (for example `jump` requires `movement`). Adding it adds the missing ones too. Optional. |

Fields:

| Field | Description |
|---|---|
| `owner` | The object the attribute is attached to. |
| `properties` | The values of this attribute on this object. |

Methods:

| Method | Description |
|---|---|
| `onAttach()` | Runs when the attribute is attached to the object (editor and game). |
| `onStart()` | Runs when the game starts (game only). |
| `onUpdate(delta)` | Runs every frame (game only). |
| `onDetach()` | Runs when the attribute is removed. |
| `dispose()` | Frees resources. |
| `toJSON()` / `fromJSON(data)` | Save to and load from the scene file. |

Attributes talk to each other through their owner:

```js
const movement = this.owner.getAttribute('movement');
```

The base object class (decision 0006) gets `getAttribute(type)` and `hasAttribute(type)`.

## Scene file

Each object in the scene file (decision 0007) lists its attributes with their values:

```json
{
  "id": "p1",
  "type": "h2n8v4",
  "attributes": [
    { "type": "a7m1q8", "properties": { "speed": 5 } },
    { "type": "b9c3d1", "properties": { "slots": 20 } }
  ]
}
```

`type` values are file IDs (decision 0013), here `characters/player`, `movement` and `inventory`. Values follow the same rules as object properties: missing values get their `default`, unknown ones are ignored.

## Order

- In the game, an object's `onStart` / `onUpdate` run first, then its attributes', in the order they were added.
- A missing or broken attribute class is handled like a missing object class (decision 0006): its entry is kept in the scene, the error goes to the logs, and the object works without it.

## Terminal commands

- `attribute add <objectId> <type>`
- `attribute remove <objectId> <type>`
- `attribute set <objectId> <type> <name> <value>`

## Why

- Object classes stay small; behavior is reused across objects (the same `movement` on a player and on an NPC).
- The AI can create and attach one small attribute at a time instead of rewriting a large class.
- The properties panel and the scene file handle attributes with the same property format as objects.

## Open questions

None for now.
