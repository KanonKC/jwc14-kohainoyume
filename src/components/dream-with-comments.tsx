"use client"

import { useRef, useSyncExternalStore } from "react"
import { motion, MotionValue, useScroll, useTransform } from "motion/react"

function segmentText(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("th", { granularity: "word" })
    const segments: string[] = []
    for (const { segment, isWordLike } of segmenter.segment(text)) {
      if (isWordLike || segment.trim()) segments.push(segment)
    }
    if (segments.length > 0) return segments
  }
  return text.split(/\s+/).filter(Boolean)
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}
const getSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
const getServerSnapshot = () => false

interface WordProps {
  children: React.ReactNode
  progress: MotionValue<number>
  range: [number, number]
}

function Word({ children, progress, range }: WordProps) {
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

interface CommentPinProps {
  comment: string
  position: (typeof CORNER_POSITIONS)[number]
  index: number
  progress: MotionValue<number>
}

function CommentPin({ comment, position, index, progress }: CommentPinProps) {
  const opacity = useTransform(progress, [0.85, 1], [0, 1])
  const scale = useTransform(progress, [0.85, 1], [0.85, 1])
  return (
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.08, zIndex: 10 }}
      className="absolute max-w-[22%] cursor-grab rounded-xl border border-border bg-card px-3 py-2 shadow-md active:cursor-grabbing"
      style={{ ...position, rotate: `${position.rotate}deg`, opacity, scale }}
    >
      <p className="text-xs leading-relaxed text-foreground">{comment}</p>
    </motion.div>
  )
}

// Comments are pinned to the four corners of the sticky viewport so they never
// overlap the centre-aligned dream text.
const CORNER_POSITIONS = [
  { top: "20%",    left: "2%",   rotate: -6 },
  { top: "20%",    right: "2%",  rotate:  5 },
  { top: "20%",   left: "42%",   rotate:  0 },
  { bottom: "20%",   left: "42%",  rotate: 0 },
  { bottom: "20%", left: "2%",   rotate:  4 },
  { bottom: "20%", right: "2%",  rotate: -5 },
]

interface DreamWithCommentsProps {
  dream: string
  comments: string[]
}

export function DreamWithComments({ dream, comments }: DreamWithCommentsProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getSnapshot,
    getServerSnapshot
  )

  const segments = segmentText(dream)
  const height = `${Math.max(200, segments.length * 8)}vh`

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  if (reducedMotion) {
    return (
      <div className="relative px-4 py-20">
        <p className="mx-auto max-w-4xl text-2xl font-bold leading-relaxed text-foreground md:text-3xl lg:text-4xl">
          {dream}
        </p>
        {comments.map((comment, i) => (
          <p key={i} className="mt-4 text-sm text-muted-foreground">
            {comment}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div ref={sectionRef} className="relative z-0" style={{ height }}>
      <div className="sticky top-0 mx-auto flex min-h-dvh max-w-4xl items-center bg-transparent px-4 py-20">
        {/* Dream text — same markup as TextReveal */}
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

        {/* Comments pinned to corners, visible only after dream text is fully revealed */}
        {comments.map((comment, i) => (
          <CommentPin
            key={i}
            comment={comment}
            position={CORNER_POSITIONS[i % CORNER_POSITIONS.length]}
            index={i}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  )
}
