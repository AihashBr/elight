import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import type { LightField } from './light-field';

@Component({
  selector: 'app-home-background',
  template: `
    <canvas #canvas [class.ready]="ready()"></canvas>
    @if (failed()) {
      <div class="fallback"></div>
    }
  `,
  styleUrl: './home-background.scss',
  host: { 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeBackground {
  protected readonly ready = signal(false);
  protected readonly failed = signal(false);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    const zone = inject(NgZone);
    let field: LightField | undefined;
    let destroyed = false;

    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      field?.dispose();
    });

    // Three.js loads in its own chunk and the render loop runs outside Angular change detection.
    afterNextRender(() => {
      zone.runOutsideAngular(async () => {
        try {
          const { createLightField } = await import('./light-field');
          if (destroyed) {
            return;
          }
          field = createLightField(this.canvas().nativeElement);
          zone.run(() => this.ready.set(true));
        } catch {
          zone.run(() => this.failed.set(true));
        }
      });
    });
  }
}
