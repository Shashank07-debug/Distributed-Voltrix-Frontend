import { useState, useEffect, useRef, useCallback } from 'react';

export type DemoChapter = 1 | 2 | 3 | 4 | 5;

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
  replay: () => void;
}

export const PROMPT_TEXT =
  'A project dashboard where my team can track tasks and see progress live';

export const FILE_TREE_ITEMS = [
  { name: 'src', isDir: true, indent: 0 },
  { name: 'main.tsx', isDir: false, indent: 1 },
  { name: 'App.tsx', isDir: false, indent: 1 },
  { name: 'components', isDir: true, indent: 1 },
  { name: 'Sidebar.tsx', isDir: false, indent: 2 },
  { name: 'TaskBoard.tsx', isDir: false, indent: 2, active: true },
  { name: 'ProgressChart.tsx', isDir: false, indent: 2 },
  { name: 'hooks', isDir: true, indent: 1 },
  { name: 'useTasks.ts', isDir: false, indent: 2 },
  { name: 'types.ts', isDir: false, indent: 1 },
];

export const CODE_LINES = [
  { num: 1, text: 'interface TaskBoardProps {' },
  { num: 2, text: '  projectId: string;' },
  { num: 3, text: '  teamMembers: string[];' },
  { num: 4, text: '}' },
  { num: 5, text: '' },
  { num: 6, text: 'export function TaskBoard({ projectId }: TaskBoardProps) {' },
  { num: 7, text: '  const { tasks, moveTask } = useTasks(projectId);' },
  { num: 8, text: '  return (' },
  { num: 9, text: '    <div className="grid grid-cols-3 gap-3">' },
  { num: 10, text: '      {COLUMNS.map((col) => (' },
  { num: 11, text: '        <Column key={col.id} title={col.name} items={tasks[col.id]} />' },
  { num: 12, text: '      ))}' },
  { num: 13, text: '    </div>' },
  { num: 14, text: '  );' },
  { num: 15, text: '}' },
];

export function useDemoTimeline(containerRef: React.RefObject<HTMLElement | null>): DemoTimelineState {
  const [chapter, setChapter] = useState<DemoChapter>(1);
  const [typedChars, setTypedChars] = useState(0);
  const [filesVisibleCount, setFilesVisibleCount] = useState(0);
  const [codeLinesCount, setCodeLinesCount] = useState(0);
  const [previewAssembled, setPreviewAssembled] = useState(false);
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

  const reset = useCallback(() => {
    if (reducedMotion) {
      setChapter(5);
      setTypedChars(PROMPT_TEXT.length);
      setFilesVisibleCount(FILE_TREE_ITEMS.length);
      setCodeLinesCount(CODE_LINES.length);
      setPreviewAssembled(true);
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
    setStatusText('Reading your prompt');
    setIsReady(false);
    startTimeRef.current = null;
    pausedAtRef.current = null;
    totalPausedDurationRef.current = 0;
  }, [reducedMotion]);

  // Observer to start at 40% in view
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
      { threshold: 0.4 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [containerRef, hasStarted, reducedMotion, reset]);

  // Pause on visibility change
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

  // Main animation tick
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

      // Chapter 1: Describe (0.0 to 3.2s)
      if (elapsed < 3.2) {
        setChapter(1);
        setStatusText('Reading your prompt');
        const progress = Math.min(1, elapsed / 3.0);
        setTypedChars(Math.floor(progress * PROMPT_TEXT.length));
      }
      // Chapter 2: Plan (3.2 to 5.4s)
      else if (elapsed < 5.4) {
        setChapter(2);
        setStatusText('Planning file structure');
        setTypedChars(PROMPT_TEXT.length);
        const planElapsed = elapsed - 3.2;
        const count = Math.min(
          FILE_TREE_ITEMS.length,
          Math.floor((planElapsed / 2.0) * FILE_TREE_ITEMS.length)
        );
        setFilesVisibleCount(count);
      }
      // Chapter 3: Generate (5.4 to 9.0s)
      else if (elapsed < 9.0) {
        setChapter(3);
        setStatusText('Writing TaskBoard.tsx');
        setFilesVisibleCount(FILE_TREE_ITEMS.length);
        const genElapsed = elapsed - 5.4;
        const count = Math.min(
          CODE_LINES.length,
          Math.floor((genElapsed / 3.2) * CODE_LINES.length)
        );
        setCodeLinesCount(count);
      }
      // Chapter 4: Preview (9.0 to 12.0s)
      else if (elapsed < 12.0) {
        setChapter(4);
        setStatusText('Rendering preview');
        setCodeLinesCount(CODE_LINES.length);
        setPreviewAssembled(true);
      }
      // Chapter 5: Ship (12.0s onwards)
      else {
        setChapter(5);
        setStatusText('Ready');
        setIsReady(true);
        // Completed - stop animation tick!
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [hasStarted, isPaused, reducedMotion]);

  const replay = useCallback(() => {
    reset();
    setHasStarted(true);
  }, [reset]);

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
    replay,
  };
}
