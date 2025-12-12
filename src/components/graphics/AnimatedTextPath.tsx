'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import styles from './AnimatedTextPath.module.css';

interface PathStyle {
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
}

interface TextStyle {
  font?: string;
  size?: number;
  color?: string;
}

interface AnimatedTextPathProps {
  texts?: string[];
  speed?: number;
  pathWildness?: number;
  verticalBounds?: number;
  showPath?: boolean;
  fixedCanvasWidth?: number;
  pathStyle?: PathStyle;
  textStyle?: TextStyle;
}

interface Point {
  x: number;
  y: number;
}

interface TextChar {
  char: string;
  width: number;
}

export function AnimatedTextPath({
  texts = ['LETS COOK'],
  speed = 50,
  pathWildness = 0.7,
  verticalBounds = 0.1,
  showPath = true,
  fixedCanvasWidth = 2560,
  pathStyle = {
    strokeColor: '#cccccc',
    strokeWidth: 40,
    opacity: 0.5,
  },
  textStyle = {
    font: 'bold 24px sans-serif',
    size: 24,
    color: '#000000',
  },
}: AnimatedTextPathProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const pathPointsRef = useRef<Point[]>([]);
  const pathLengthRef = useRef<number>(0);
  const textCharsRef = useRef<TextChar[]>([]);
  const totalTextWidthRef = useRef<number>(0);
  const viewportWidthRef = useRef<number>(0);
  const canvasWidthRef = useRef<number>(fixedCanvasWidth);
  const canvasHeightRef = useRef<number>(400);

  const [selectedText] = useState(() =>
    texts[Math.floor(Math.random() * texts.length)]
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Catmull-Rom spline interpolation
  const catmullRom = useCallback(
    (p0: number, p1: number, p2: number, p3: number, t: number): number => {
      const t2 = t * t;
      const t3 = t2 * t;

      return (
        0.5 *
        (2 * p1 +
          (-p0 + p2) * t +
          (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
          (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
      );
    },
    []
  );

  // Smooth the path to reduce sharp changes
  const smoothPath = useCallback((points: Point[]): Point[] => {
    const smoothedPoints: Point[] = [];
    const windowSize = 5;

    for (let i = 0; i < points.length; i++) {
      let sumX = 0;
      let sumY = 0;
      let count = 0;

      for (let j = -windowSize; j <= windowSize; j++) {
        const index = i + j;
        if (index >= 0 && index < points.length) {
          const weight = Math.exp(-(j * j) / (windowSize * 0.5));
          sumX += points[index].x * weight;
          sumY += points[index].y * weight;
          count += weight;
        }
      }

      smoothedPoints.push({
        x: sumX / count,
        y: sumY / count,
      });
    }

    return smoothedPoints;
  }, []);

  // Calculate path length
  const calculatePathLength = useCallback((points: Point[]): number => {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }, []);

  // Generate smooth random path
  const generatePath = useCallback(
    (width: number, height: number) => {
      const extendedWidth = width * 1.5;
      const startX = -width * 0.25;

      const baseNumCurves = 4;
      const wildnessRange = Math.floor(pathWildness * 4);
      const numCurves =
        baseNumCurves + Math.floor(Math.random() * (wildnessRange + 1));
      const points: Point[] = [];

      const spacings: number[] = [];
      let totalSpacing = 0;

      for (let i = 0; i < numCurves; i++) {
        const spacing = 0.5 + Math.random();
        spacings.push(spacing);
        totalSpacing += spacing;
      }

      const normalizedSpacings = spacings.map(
        (s) => (s / totalSpacing) * extendedWidth
      );

      let currentX = startX;
      const minY = height * verticalBounds;
      const maxY = height * (1 - verticalBounds);
      const yRange = maxY - minY;

      for (let i = 0; i < numCurves; i++) {
        const x = currentX + normalizedSpacings[i] * 0.5;

        let y: number;
        if (i === 0) {
          const baseRange = 0.4;
          const wildnessBonus = pathWildness * 0.2;
          const totalRange = Math.min(baseRange + wildnessBonus, 0.8);
          const startOffset = (1 - totalRange) / 2;
          y = minY + yRange * (startOffset + Math.random() * totalRange);
        } else {
          const previousY = points[i - 1].y;
          const isHigh = previousY > (minY + maxY) / 2;

          const baseVariation = 0.35;
          const wildnessVariation = pathWildness * 0.4;
          const maxVariation = Math.min(baseVariation + wildnessVariation, 0.8);

          if (isHigh) {
            y = minY + yRange * (Math.random() * maxVariation);
          } else {
            y = minY + yRange * (1 - maxVariation + Math.random() * maxVariation);
          }
        }

        points.push({ x, y });
        currentX += normalizedSpacings[i];
      }

      points.push({
        x: currentX + width * 0.25,
        y: points[0].y + (Math.random() - 0.5) * yRange * 0.3,
      });

      let pathPoints: Point[] = [];
      const resolution = 5;

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const steps = Math.ceil(Math.abs(p2.x - p1.x) / resolution);

        for (let t = 0; t < steps; t++) {
          const ratio = t / steps;
          const x = catmullRom(p0.x, p1.x, p2.x, p3.x, ratio);
          const y = catmullRom(p0.y, p1.y, p2.y, p3.y, ratio);

          pathPoints.push({ x, y });
        }
      }

      pathPoints = smoothPath(pathPoints);
      pathPointsRef.current = pathPoints;
      pathLengthRef.current = calculatePathLength(pathPoints);
    },
    [pathWildness, verticalBounds, catmullRom, smoothPath, calculatePathLength]
  );

  // Get smoothed angle by averaging nearby segments
  const getSmoothedAngle = useCallback(
    (segmentIndex: number): number => {
      const pathPoints = pathPointsRef.current;
      const lookAhead = 15;
      let totalDx = 0;
      let totalDy = 0;
      let count = 0;

      for (let offset = -lookAhead; offset <= lookAhead; offset++) {
        const index = segmentIndex + offset;

        if (index >= 0 && index < pathPoints.length - 1) {
          const weight = Math.exp(-(offset * offset) / (lookAhead * 0.5));
          const dx = pathPoints[index + 1].x - pathPoints[index].x;
          const dy = pathPoints[index + 1].y - pathPoints[index].y;

          totalDx += dx * weight;
          totalDy += dy * weight;
          count += weight;
        }
      }

      return Math.atan2(totalDy / count, totalDx / count);
    },
    []
  );

  // Get point and angle at specific distance along path
  const getPointAtDistance = useCallback(
    (
      distance: number
    ): {
      x: number;
      y: number;
      angle: number;
    } => {
      const pathPoints = pathPointsRef.current;
      const pathLength = pathLengthRef.current;

      while (distance < 0) distance += pathLength;
      distance = distance % pathLength;

      let currentDistance = 0;

      for (let i = 1; i < pathPoints.length; i++) {
        const dx = pathPoints[i].x - pathPoints[i - 1].x;
        const dy = pathPoints[i].y - pathPoints[i - 1].y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);

        if (currentDistance + segmentLength >= distance) {
          const ratio = (distance - currentDistance) / segmentLength;
          const x = pathPoints[i - 1].x + dx * ratio;
          const y = pathPoints[i - 1].y + dy * ratio;
          const smoothAngle = getSmoothedAngle(i - 1);

          return { x, y, angle: smoothAngle };
        }

        currentDistance += segmentLength;
      }

      const lastPoint = pathPoints[pathPoints.length - 1];
      const smoothAngle = getSmoothedAngle(pathPoints.length - 2);
      return { ...lastPoint, angle: smoothAngle };
    },
    [getSmoothedAngle]
  );

  // Create repeated text
  const createRepeatedText = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.font = textStyle.font || 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const separator = '  ';
      const pattern = selectedText + separator;

      const chars: TextChar[] = [];
      let calculatedWidth = 0;

      for (const char of pattern) {
        const metrics = ctx.measureText(char);
        const charWidth = metrics.width * 1.15;

        chars.push({ char, width: charWidth });
        calculatedWidth += charWidth;
      }

      textCharsRef.current = chars;
      totalTextWidthRef.current = calculatedWidth;
    },
    [selectedText, textStyle.font]
  );

  // Render frame
  const render = useCallback(
    (progress: number) => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      const pathPoints = pathPointsRef.current;
      const pathLength = pathLengthRef.current;
      const textChars = textCharsRef.current;
      const totalTextWidth = totalTextWidthRef.current;
      const viewportWidth = viewportWidthRef.current;
      const canvasWidth = canvasWidthRef.current;
      const canvasHeight = canvasHeightRef.current;

      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const centerOffset = (canvasWidth - viewportWidth) / 2;

      // Draw path stroke
      if (showPath) {
        ctx.save();
        ctx.strokeStyle = pathStyle.strokeColor || '#cccccc';
        ctx.lineWidth = pathStyle.strokeWidth || 40;
        ctx.globalAlpha = pathStyle.opacity || 0.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        let started = false;

        for (let i = 0; i < pathPoints.length; i++) {
          const point = pathPoints[i];
          if (!started) {
            ctx.moveTo(point.x, point.y);
            started = true;
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }

        ctx.stroke();
        ctx.restore();
      }

      // Set text style
      ctx.font = textStyle.font || 'bold 24px sans-serif';
      ctx.fillStyle = textStyle.color || '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const offset = -(progress * pathLength) % totalTextWidth;
      let currentDistance = -offset;

      while (currentDistance < pathLength + totalTextWidth) {
        let charPosition = 0;

        for (let i = 0; i < textChars.length; i++) {
          const { char, width } = textChars[i];
          const distance = currentDistance + charPosition + width / 2;

          if (distance >= 0 && distance <= pathLength) {
            const point = getPointAtDistance(distance);

            if (
              point.x > centerOffset - 200 &&
              point.x < centerOffset + viewportWidth + 200
            ) {
              ctx.save();
              ctx.translate(point.x, point.y);
              ctx.rotate(point.angle);
              ctx.fillText(char, 0, 0);
              ctx.restore();
            }
          }

          charPosition += width;
        }

        currentDistance += totalTextWidth;
      }
    },
    [showPath, pathStyle, textStyle, getPointAtDistance]
  );

  // Setup canvas and animation
  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container || typeof window === 'undefined') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;

    const rect = container.getBoundingClientRect();
    canvasHeightRef.current = rect.height;
    viewportWidthRef.current = rect.width;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = fixedCanvasWidth * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    generatePath(fixedCanvasWidth, rect.height);
    createRepeatedText(ctx);

    const duration = pathLengthRef.current / speed;

    if (animationRef.current) {
      animationRef.current.kill();
    }

    animationRef.current = gsap.to(
      { progress: 0 },
      {
        progress: 1,
        duration,
        ease: 'none',
        repeat: -1,
        onUpdate: function () {
          render(this.targets()[0].progress);
        },
      }
    );
  }, [fixedCanvasWidth, speed, generatePath, createRepeatedText, render]);

  // Handle resize
  const handleResize = useCallback(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    const rect = container.getBoundingClientRect();
    viewportWidthRef.current = rect.width;

    if (animationRef.current) {
      render(animationRef.current.progress());
    }
  }, [render]);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Setup and cleanup
  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion) return;

    setup();
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [setup, handleResize, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className={styles.animatedTextPathContainer} ref={containerRef}>
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          className={styles.animatedTextPath}
          aria-hidden="true"
        />
      </div>
      <span className={styles.srOnly}>{selectedText}</span>
    </div>
  );
}
