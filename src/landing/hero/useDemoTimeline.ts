import { useState, useEffect, useRef, useCallback } from 'react';

export type DemoChapter = 1 | 2 | 3 | 4 | 5;

export interface PresetDemoData {
  id: string;
  label: string;
  prompt: string;
  files: { name: string; isDir: boolean; indent: number; active?: boolean }[];
  activeFileName: string;
  codeLines: { num: number; text: string }[];
  previewTitle: string;
  previewUrl: string;
  previewTasks: { todo: string; active: string; done: string };
}

export const PRESET_DEMOS: PresetDemoData[] = [
  {
    id: 'tasks',
    label: 'a habit tracker',
    prompt: 'A daily habit tracker with streaks, progress metrics, and team nudges',
    activeFileName: 'HabitBoard.tsx',
    previewTitle: 'Daily Habits',
    previewUrl: 'localhost:3000/habits',
    files: [
      { name: 'src', isDir: true, indent: 0 },
      { name: 'main.tsx', isDir: false, indent: 1 },
      { name: 'App.tsx', isDir: false, indent: 1 },
      { name: 'components', isDir: true, indent: 1 },
      { name: 'HabitBoard.tsx', isDir: false, indent: 2, active: true },
      { name: 'StreakChart.tsx', isDir: false, indent: 2 },
      { name: 'hooks', isDir: true, indent: 1 },
      { name: 'useHabits.ts', isDir: false, indent: 2 },
      { name: 'types.ts', isDir: false, indent: 1 },
    ],
    codeLines: [
      { num: 1, text: 'interface HabitBoardProps {' },
      { num: 2, text: '  userId: string;' },
      { num: 3, text: '  streakDays: number;' },
      { num: 4, text: '}' },
      { num: 5, text: '' },
      { num: 6, text: 'export function HabitBoard({ streakDays }: HabitBoardProps) {' },
      { num: 7, text: '  const { habits, toggleHabit } = useHabits();' },
      { num: 8, text: '  return (' },
      { num: 9, text: '    <div className="grid grid-cols-3 gap-3">' },
      { num: 10, text: '      {habits.map((item) => (' },
      { num: 11, text: '        <HabitCard key={item.id} habit={item} onCheck={toggleHabit} />' },
      { num: 12, text: '      ))}' },
      { num: 13, text: '    </div>' },
      { num: 14, text: '  );' },
      { num: 15, text: '}' },
    ],
    previewTasks: {
      todo: 'Morning Hydration',
      active: '15m Deep Coding',
      done: 'Push Daily Git Commit',
    },
  },
  {
    id: 'portfolio',
    label: 'a portfolio site',
    prompt: 'Minimal dark developer portfolio with project showcases and interactive terminal',
    activeFileName: 'ProjectGrid.tsx',
    previewTitle: 'Works & Case Studies',
    previewUrl: 'localhost:3000/work',
    files: [
      { name: 'src', isDir: true, indent: 0 },
      { name: 'main.tsx', isDir: false, indent: 1 },
      { name: 'App.tsx', isDir: false, indent: 1 },
      { name: 'components', isDir: true, indent: 1 },
      { name: 'ProjectGrid.tsx', isDir: false, indent: 2, active: true },
      { name: 'TerminalView.tsx', isDir: false, indent: 2 },
      { name: 'types.ts', isDir: false, indent: 1 },
    ],
    codeLines: [
      { num: 1, text: 'export function ProjectGrid() {' },
      { num: 2, text: '  const { projects } = useProjects();' },
      { num: 3, text: '  return (' },
      { num: 4, text: '    <section className="grid grid-cols-2 gap-4">' },
      { num: 5, text: '      {projects.map(p => <CaseStudyCard key={p.slug} data={p} />)}' },
      { num: 6, text: '    </section>' },
      { num: 7, text: '  );' },
      { num: 8, text: '}' },
    ],
    previewTasks: {
      todo: 'Add Raytracing Demo',
      active: 'Monaco Theme Config',
      done: 'Fluid Typography Scale',
    },
  },
  {
    id: 'bio',
    label: 'a link-in-bio page',
    prompt: 'A creator link-in-bio hub with live social feeds and tip jar checkout',
    activeFileName: 'BioHub.tsx',
    previewTitle: 'Creator Links',
    previewUrl: 'localhost:3000/me',
    files: [
      { name: 'src', isDir: true, indent: 0 },
      { name: 'App.tsx', isDir: false, indent: 1 },
      { name: 'components', isDir: true, indent: 1 },
      { name: 'BioHub.tsx', isDir: false, indent: 2, active: true },
      { name: 'SocialFeed.tsx', isDir: false, indent: 2 },
      { name: 'TipButton.tsx', isDir: false, indent: 2 },
    ],
    codeLines: [
      { num: 1, text: 'export function BioHub({ creator }: BioProps) {' },
      { num: 2, text: '  return (' },
      { num: 3, text: '    <div className="max-w-md mx-auto space-y-3">' },
      { num: 4, text: '      <Avatar src={creator.avatar} size="lg" />' },
      { num: 5, text: '      <SocialLinks items={creator.links} />' },
      { num: 6, text: '    </div>' },
      { num: 7, text: '  );' },
      { num: 8, text: '}' },
    ],
    previewTasks: {
      todo: 'Stripe Tip Checkout',
      active: 'GitHub Activity Stream',
      done: 'Spotify Currently Playing',
    },
  },
];

export interface DemoTimelineState {
  chapter: DemoChapter;
  typedChars: number;
  filesVisibleCount: number;
  codeLinesCount: number;
  previewAssembled: boolean;
  statusText: string;
  isReady: boolean;
  isPaused: boolean;
  hasStarted: boolean;
  progressPercent: number;
  selectedPreset: PresetDemoData;
  selectPreset: (presetId: string) => void;
  replay: () => void;
}

export function useDemoTimeline(containerRef: React.RefObject<HTMLElement | null>): DemoTimelineState {
  const [selectedPreset, setSelectedPreset] = useState<PresetDemoData>(PRESET_DEMOS[0]);
  const [chapter, setChapter] = useState<DemoChapter>(1);
  const [typedChars, setTypedChars] = useState(0);
  const [filesVisibleCount, setFilesVisibleCount] = useState(0);
  const [codeLinesCount, setCodeLinesCount] = useState(0);
  const [previewAssembled, setPreviewAssembled] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusText, setStatusText] = useState('Reading your prompt');
  const [isReady, setIsReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedDurationRef = useRef<number>(0);

  const reset = useCallback(
    (preset = selectedPreset) => {
      if (reducedMotion) {
        setChapter(5);
        setTypedChars(preset.prompt.length);
        setFilesVisibleCount(preset.files.length);
        setCodeLinesCount(preset.codeLines.length);
        setPreviewAssembled(true);
        setProgressPercent(100);
        setStatusText('Ready');
        setIsReady(true);
        setHasStarted(true);
        return;
      }

      setChapter(1);
      setTypedChars(0);
      setFilesVisibleCount(0);
      setCodeLinesCount(0);
      setPreviewAssembled(false);
      setProgressPercent(0);
      setStatusText('Reading your prompt');
      setIsReady(false);
      startTimeRef.current = null;
      pausedAtRef.current = null;
      totalPausedDurationRef.current = 0;
    },
    [reducedMotion, selectedPreset]
  );

  useEffect(() => {
    if (reducedMotion) {
      reset();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.35 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [containerRef, hasStarted, reducedMotion, reset]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
        pausedAtRef.current = performance.now();
      } else {
        setIsPaused(false);
        if (pausedAtRef.current !== null) {
          totalPausedDurationRef.current += performance.now() - pausedAtRef.current;
          pausedAtRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!hasStarted || reducedMotion) return;

    const tick = (now: number) => {
      if (isPaused) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }

      const elapsed = (now - startTimeRef.current - totalPausedDurationRef.current) / 1000;

      // Chapter 1: Describe (0.0 to 3.0s)
      if (elapsed < 3.0) {
        setChapter(1);
        setStatusText('Reading your prompt');
        const progress = Math.min(1, elapsed / 2.8);
        setTypedChars(Math.floor(progress * selectedPreset.prompt.length));
        setProgressPercent(Math.floor(progress * 25));
      }
      // Chapter 2: Plan (3.0 to 5.2s)
      else if (elapsed < 5.2) {
        setChapter(2);
        setStatusText('Planning file structure');
        setTypedChars(selectedPreset.prompt.length);
        const planElapsed = elapsed - 3.0;
        const count = Math.min(
          selectedPreset.files.length,
          Math.floor((planElapsed / 2.0) * selectedPreset.files.length)
        );
        setFilesVisibleCount(count);
        setProgressPercent(25 + Math.floor((planElapsed / 2.2) * 25));
      }
      // Chapter 3: Generate (5.2 to 8.6s)
      else if (elapsed < 8.6) {
        setChapter(3);
        setStatusText(`Writing ${selectedPreset.activeFileName}`);
        setFilesVisibleCount(selectedPreset.files.length);
        const genElapsed = elapsed - 5.2;
        const count = Math.min(
          selectedPreset.codeLines.length,
          Math.floor((genElapsed / 3.0) * selectedPreset.codeLines.length)
        );
        setCodeLinesCount(count);
        setProgressPercent(50 + Math.floor((genElapsed / 3.4) * 25));
      }
      // Chapter 4: Preview (8.6 to 11.5s)
      else if (elapsed < 11.5) {
        setChapter(4);
        setStatusText('Rendering preview');
        setCodeLinesCount(selectedPreset.codeLines.length);
        setPreviewAssembled(true);
        const prevElapsed = elapsed - 8.6;
        setProgressPercent(75 + Math.floor((prevElapsed / 2.9) * 25));
      }
      // Chapter 5: Ship (11.5s onwards)
      else {
        setChapter(5);
        setStatusText('Ready');
        setProgressPercent(100);
        setIsReady(true);
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [hasStarted, isPaused, reducedMotion, selectedPreset]);

  const selectPreset = useCallback(
    (presetId: string) => {
      const found = PRESET_DEMOS.find((p) => p.id === presetId);
      if (found) {
        setSelectedPreset(found);
        reset(found);
        setHasStarted(true);
      }
    },
    [reset]
  );

  const replay = useCallback(() => {
    reset(selectedPreset);
    setHasStarted(true);
  }, [reset, selectedPreset]);

  return {
    chapter,
    typedChars,
    filesVisibleCount,
    codeLinesCount,
    previewAssembled,
    statusText,
    isReady,
    isPaused,
    hasStarted,
    progressPercent,
    selectedPreset,
    selectPreset,
    replay,
  };
}
