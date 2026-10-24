import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

type AiState = 'thinking' | 'generating' | 'ready';

interface DemoSession {
  prompt: string;
  output: string;
}

interface Feature {
  icon: 'offline' | 'eye' | 'scene' | 'chip';
  title: string;
  text: string;
}

const THEME_KEY = 'elight-theme';

const SESSIONS: DemoSession[] = [
  {
    prompt: 'Add a mossy stone bridge over the river, lit at dusk.',
    output:
      '+ mesh      stone_bridge_01   2.4k tris\n' +
      '+ material  moss_stone        PBR\n' +
      '~ light     sun -> 18:40      warm 3200K\n' +
      '✓ 3 changes staged for review',
  },
  {
    prompt: 'Give the guard NPC a short, nervous greeting.',
    output:
      '+ dialogue  guard_greeting    4 lines\n' +
      '~ npc       guard_02          mood: anxious\n' +
      '+ voice     line_01..04       local TTS\n' +
      '✓ 3 changes staged for review',
  },
];

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly theme = signal<'dark' | 'light'>(this.initialTheme());

  protected readonly aiState = signal<AiState>('thinking');
  protected readonly prompt = signal(SESSIONS[0].prompt);
  protected readonly output = signal('');
  protected readonly tokensPerSecond = signal(0);

  protected readonly features: Feature[] = [
    {
      icon: 'offline',
      title: 'Runs fully offline',
      text: 'Models load from disk and run on your GPU. No account, no API key, no data leaving the machine.',
    },
    {
      icon: 'eye',
      title: 'Transparent by design',
      text: 'Every prompt, token and scene change is visible. The model proposes, you decide what lands.',
    },
    {
      icon: 'scene',
      title: 'Scene-aware assistant',
      text: 'The AI reads your hierarchy, materials and scripts, so its suggestions fit the world you are building.',
    },
    {
      icon: 'chip',
      title: 'Bring your own model',
      text: 'Swap between open-weight models and quantizations to balance quality, speed and memory.',
    },
  ];

  protected readonly steps = [
    { label: 'Describe', text: 'Ask in plain language, from the editor console or in-game.' },
    { label: 'Inspect', text: 'Watch the model reason and preview each proposed change.' },
    { label: 'Commit', text: 'Accept, tweak or discard. Everything stays undoable.' },
  ];

  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
    this.applyTheme(this.theme());

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.output.set(SESSIONS[0].output);
      this.tokensPerSecond.set(84);
      this.aiState.set('ready');
    } else {
      this.runSession(0);
    }
  }

  protected toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this visit.
    }
  }

  // Plays a scripted session: thinking -> streaming output -> ready, then moves to the next one.
  private runSession(index: number): void {
    const session = SESSIONS[index % SESSIONS.length];
    this.prompt.set(session.prompt);
    this.output.set('');
    this.tokensPerSecond.set(0);
    this.aiState.set('thinking');

    this.timer = setTimeout(() => {
      this.aiState.set('generating');
      let typed = 0;
      const stream = () => {
        typed = Math.min(session.output.length, typed + 2 + Math.floor(Math.random() * 3));
        this.output.set(session.output.slice(0, typed));
        this.tokensPerSecond.set(78 + Math.floor(Math.random() * 12));
        if (typed < session.output.length) {
          this.timer = setTimeout(stream, 28);
        } else {
          this.aiState.set('ready');
          this.timer = setTimeout(() => this.runSession(index + 1), 4200);
        }
      };
      stream();
    }, 1400);
  }

  private initialTheme(): 'dark' | 'light' {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch {
      // Fall through to the system preference.
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  private applyTheme(theme: 'dark' | 'light'): void {
    document.documentElement.dataset['theme'] = theme;
  }
}
