import React from 'react';
import { drawScene, SCENE_W, SCENE_H, SceneState } from './scene';
import { HOTSPOTS, hotspotBox, Hotspot, PanelId } from './hotspots';
import { Panels } from './Panels';
import { profile } from '../../data/resume';

const CAT_LINES = [
  'mrrp.',
  'The cat has reviewed your code. It needs more naps.',
  'Purring at a steady 60 fps.',
  'Do not disturb — deep in thought (asleep).',
  'You may pet the pixels once.',
];

const MENU: { id: PanelId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'demos', label: 'Demos' },
  { id: 'resume', label: 'Résumé' },
  { id: 'contact', label: 'Contact' },
];

export const PixelRoom: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [panel, setPanel] = React.useState<PanelId | null>(null);
  const [lampOn, setLampOn] = React.useState(true);
  const [toast, setToast] = React.useState<string | null>(null);
  const [hint, setHint] = React.useState(false);
  const catCount = React.useRef(0);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout>>();

  // mirror interactive state into a ref so the rAF loop always sees fresh values
  const sceneState = React.useRef<SceneState>({ hovered: null, lampOn: true });
  sceneState.current.hovered = hovered;
  sceneState.current.lampOn = lampOn;

  // render loop
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const t = (now - start) / 1000;
      drawScene(ctx, t, sceneState.current);
      raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      // a calm, still room: draw once and only refresh on interaction
      drawScene(ctx, 0.5, sceneState.current);
      const iv = setInterval(
        () => drawScene(ctx, 0.5, sceneState.current),
        250,
      );
      return () => clearInterval(iv);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // integer-scale the stage so pixels stay crisp
  React.useEffect(() => {
    const fit = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const raw = Math.min(vw / SCENE_W, vh / SCENE_H);
      const scale = raw >= 1 ? Math.floor(raw) : raw; // integer upscale, fractional downscale
      stage.style.width = `${SCENE_W * scale}px`;
      stage.style.height = `${SCENE_H * scale}px`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // deep link: /?p=work opens a panel directly (also handy for sharing)
  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('p');
    const valid: PanelId[] = [
      'about',
      'work',
      'skills',
      'education',
      'demos',
      'resume',
      'contact',
      'terminal',
    ];
    if (p && (valid as string[]).includes(p)) setPanel(p as PanelId);
  }, []);

  // gentle first-visit hint
  React.useEffect(() => {
    const t1 = setTimeout(() => setHint(true), 900);
    const t2 = setTimeout(() => setHint(false), 8000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const activate = (h: Hotspot) => {
    setHint(false);
    if (h.action === 'lamp') {
      setLampOn((v) => {
        showToast(
          v
            ? 'Lights out. The screens keep watch.'
            : 'And there was (warm) light.',
        );
        return !v;
      });
      return;
    }
    if (h.action === 'cat') {
      showToast(CAT_LINES[catCount.current++ % CAT_LINES.length]);
      return;
    }
    if (h.panel) setPanel(h.panel);
  };

  return (
    <div className="room-viewport">
      {/* header */}
      <header className="room-header">
        <div className="room-title">
          <span className="room-name">{profile.name}</span>
          <span className="room-sub">{profile.tagline}</span>
        </div>
        <nav className="room-menu" aria-label="Sections">
          {MENU.map((m) => (
            <button
              key={m.id}
              className="room-menu-chip"
              onClick={() => setPanel(m.id)}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </header>

      {/* the scene */}
      <div className="room-stage" ref={stageRef}>
        <canvas
          ref={canvasRef}
          width={SCENE_W}
          height={SCENE_H}
          className="room-canvas"
          aria-hidden="true"
        />
        {HOTSPOTS.map((h) => {
          const b = hotspotBox(h);
          return (
            <button
              key={h.id}
              className="room-hotspot"
              style={{
                left: `${(b.x / SCENE_W) * 100}%`,
                top: `${(b.y / SCENE_H) * 100}%`,
                width: `${(b.w / SCENE_W) * 100}%`,
                height: `${(b.h / SCENE_H) * 100}%`,
              }}
              aria-label={h.label}
              onMouseEnter={() => setHovered(h.id)}
              onMouseLeave={() => setHovered((v) => (v === h.id ? null : v))}
              onFocus={() => setHovered(h.id)}
              onBlur={() => setHovered((v) => (v === h.id ? null : v))}
              onClick={() => activate(h)}
            >
              <span className="room-tooltip" role="presentation">
                {h.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* hint + toast */}
      <div
        className={`room-hint ${hint && !panel ? 'room-hint-show' : ''}`}
        aria-hidden={!hint}
      >
        ✦ everything in this room is clickable ✦
      </div>
      {toast && (
        <div className="room-toast" role="status">
          {toast}
        </div>
      )}

      <Panels open={panel} onClose={() => setPanel(null)} />

      <noscript>
        <div className="room-noscript">
          <p>
            Hi, I&apos;m Atul Goel — I build games, fintech products, and the
            teams behind them. <a href={profile.resumePdf}>Résumé (PDF)</a> ·{' '}
            <a href={profile.links.linkedin}>LinkedIn</a> ·{' '}
            <a href={profile.links.github}>GitHub</a> ·{' '}
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </p>
        </div>
      </noscript>
    </div>
  );
};
