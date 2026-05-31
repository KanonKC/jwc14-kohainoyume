"use client"

import {
  useRef,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
} from "react"
import { motion, MotionValue, useScroll, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

function segmentText(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("th", { granularity: "word" })
    const segments: string[] = []
    for (const { segment, isWordLike } of segmenter.segment(text)) {
      if (isWordLike || segment.trim()) {
        segments.push(segment)
      }
    }
    if (segments.length > 0) return segments
  }
  return text.split(/\s+/).filter(Boolean)
}

function computeScrollHeight(segmentCount: number): string {
  const vh = Math.max(200, segmentCount * 8)
  return `${vh}vh`
}

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", callback)
  return () => mq.removeEventListener("change", callback)
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getReducedMotionServerSnapshot() {
  return false
}

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string
  scrollHeight?: string
}

export const TextReveal: FC<TextRevealProps> = ({
  children,
  className,
  scrollHeight,
}) => {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )

  const segments = segmentText(children)
  const height = scrollHeight ?? computeScrollHeight(segments.length)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  if (reducedMotion) {
    return (
      <div className={cn("relative z-0 px-4 py-20", className)}>
        <p className="mx-auto max-w-4xl text-2xl font-bold leading-relaxed text-foreground md:text-3xl lg:text-4xl">
          {children}
        </p>
      </div>
    )
  }

  return (
    <div
      ref={sectionRef}
      className={cn("relative z-0", className)}
      style={{ height }}
    >
      <div className="sticky top-0 mx-auto flex min-h-dvh max-w-4xl items-center bg-transparent px-4 py-20">
        <span className="flex flex-wrap p-5 text-2xl font-bold text-foreground/20 md:p-8 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl">
          {segments.map((segment, i) => {
            const start = i / segments.length
            const end = start + 1 / segments.length
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {segment}
              </Word>
            )
          })}
        </span>
      </div>
    </div>
  )
}

interface WordProps {
  children: ReactNode
  progress: MotionValue<number>
  range: [number, number]
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1])
  return (
    <span className="relative mx-0.5 lg:mx-1">
      <span className="absolute opacity-30">{children}</span>
      <motion.span style={{ opacity }} className="text-foreground">
        {children}
      </motion.span>
    </span>
  )
}
