# 0014: AI agent pipeline in the chat

- Status: accepted
- Date: 2026-10-24

## Decision

The AI chat (`docs/routes/engine.md`) runs a pipeline of five agents. Each agent has one job, its own instructions and only the context it needs. Every step is shown in the chat.

All agents run on the same local model (decision 0012), one after another: an agent is a role (instructions plus input and output format), not a separate model. Small, focused prompts suit a small model with a short context.

```
user prompt
   |
   v
1. Prompt agent        improves the prompt, translates it to English
   |
   v
2. Planner agent       splits it into tasks, each with its own context
   |
   v
 task queue  ---->  3. Object developer     (object classes)
                    4. Attribute developer  (attribute classes)
                          |
                          v
                    5. Test agent  (per file; fixes and re-checks, max 3 rounds)
```

## Example

User: "create a player".

1. **Prompt agent:** "Create a `player` object class. Create a `move` attribute that moves its owner with W, A, S, D, and a `jump` attribute that makes it jump with Space. Give the player both attributes as defaults."
2. **Planner agent:** three tasks: (1) create the `jump` attribute, (2) create the `move` attribute, (3) create the `player` object class with `move` and `jump` as default attributes.
3. Tasks 1 and 2 go to the attribute developer; task 3 to the object developer.
4. The test agent checks each of the three files on its own.

## The agents

### 1. Prompt agent

- **Input:** the user's message, the list of the project's objects and attributes (paths and labels), and a summary of the object and attribute system (decisions 0006 and 0011).
- **Job:** turns a short request into a precise one, split into object classes and attributes; translates it to English.
- **Also classifies the request:**
  - **code**: new or changed classes; goes on to the planner;
  - **command**: a scene action (for example "add a cube"); turned into terminal commands (`docs/routes/engine.md`), shown and run;
  - **question**: answered directly, with no tasks.
- **Output:** the improved prompt in English and the request kind.

### 2. Planner agent

- **Input:** the improved prompt and the list of the project's objects and attributes.
- **Job:** splits the work into tasks, one file per task, and writes for each task only the context it needs.
- **Output:** a task list in JSON (using WebLLM's JSON mode), one entry per task:

| Field | Description |
|---|---|
| `id` | Task number. |
| `kind` | `object` or `attribute`. |
| `action` | `create` or `edit`. |
| `path` | File path, for example `attributes/jump`. |
| `goal` | What the class must do. |
| `context` | Only what this task needs: the names and properties of related classes, keys, values. For `edit`, the current file content. |
| `dependsOn` | Tasks that must finish first (for example the player depends on `move` and `jump`). |

### 3. Object developer agent

- **Input:** one task and the `GameObject` contract (decision 0006).
- **Output:** the full code of one object class.

### 4. Attribute developer agent

- **Input:** one task and the `GameAttribute` contract (decision 0011).
- **Output:** the full code of one attribute class.

### 5. Test agent

Runs once per file, so three times in the example.

1. A **validator** (plain code, not the AI) checks the file:
   - it parses (no syntax errors);
   - it extends `GameObject` or `GameAttribute` and exports the class;
   - required static items exist (`label`, valid `properties` definitions, required keys such as each property's `label`);
   - an object class has `onRender`;
   - it does not import Three.js or other libraries directly (decision 0008).
2. If the validator passes, the task is done.
3. If not, the test agent gets the code, the validator's errors and the task context from the planner, and returns a fixed version.
4. The fixed version is checked again by a new test agent run.
5. **Safety limit: 3 rounds.** After 3 failed rounds the task stops as failed.

## Queue

- Tasks run one at a time (one model in memory), in an order that respects `dependsOn`.
- A file is written to the project only through the projects service, so `files.json` is updated (decision 0013), and the AI change is logged (decision 0010).
- A failed task still saves its last version, so the user can fix it in the script editor. It is handled as a broken class (decision 0006) and marked as failed in the chat. Tasks that depend on it are skipped and marked as such.
- The user can stop the pipeline at any time with a "Stop" button: the current generation is cancelled (`InferenceBackend.cancel()`) and the remaining tasks are dropped.

## In the chat

Each step is a card that updates live:

```
[done]    1. Prompt     "Create a player object class. ..."        (expand)
[done]    2. Plan       3 tasks                                     (expand)
[done]    Task 1: attributes/jump      test: passed (round 1)
[running] Task 2: attributes/move      test: round 2 of 3
[waiting] Task 3: objects/player
                                                         [Stop]
```

- A card can be expanded to see its output: the improved prompt, the task list, the code and each test round with its errors.
- Generated text streams into the card while the agent writes.
- At the end, a short summary lists the files created or changed and any failures, in the user's language.

## Where it lives

- The agents' instructions and output formats are part of the engine (app code), not of the project.
- An agent pipeline service runs the steps and the queue, and the AI chat service shows them; both in the engine page's `services/` folder.
- The validator is a service. Parsing uses a JS parser library, wrapped by its own service (decision 0008).

## Why

- A small model does better with one small, clear job at a time than with one large prompt.
- Splitting the context per task keeps each prompt inside a short context window.
- A plain-code validator makes "does it compile" a fact, not the model's opinion; the model only fixes what the validator reports.
- The round limit prevents endless fix loops.

## Open questions

- Test how well the ~2B model follows these roles, and tune the instructions per agent.
