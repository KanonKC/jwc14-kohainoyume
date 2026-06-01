"use client"

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDown, Loader2 } from "lucide-react"

import { Camper, camperData } from "@/app/data"
import { Button } from "@/components/ui/button"
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern"
import { TextReveal } from "@/components/ui/text-reveal"
import { DreamWithComments } from "@/components/dream-with-comments"
import { cn } from "@/lib/utils"

type ViewState = "idle" | "loading" | "success" | "error"

export function CamperExperience() {
  const [viewState, setViewState] = useState<ViewState>("idle")
  const [camperId, setCamperId] = useState("")
  const [camper, setCamper] = useState<Camper | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showScrollHint, setShowScrollHint] = useState(true)

  const handleSubmit = useCallback(
    (event: { preventDefault(): void }) => {
      event.preventDefault()
      const trimmedId = camperId.trim()
      if (!trimmedId) {
        setError("กรุณากรอก Camper ID")
        setViewState("error")
        return
      }

      const found = camperData.find(
        (c) => c.camper_id.trim().toLowerCase() === trimmedId.toLowerCase()
      ) as Camper | undefined

      if (!found) {
        setError("ไม่พบ Camper ID นี้ ลองตรวจสอบอีกครั้ง")
        setViewState("error")
        return
      }

      setCamper(found)
      setViewState("success")
      window.scrollTo(0, 0)
    },
    [camperId]
  )

  useEffect(() => {
    if (viewState !== "success") return

    const handleScroll = () => {
      if (window.scrollY > 40) setShowScrollHint(false)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [viewState])

  return (
    <div className="relative min-h-dvh bg-background">
      <AnimatePresence mode="wait">
        {viewState !== "success" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
              <InteractiveGridPattern
                width={40}
                height={40}
                squares={[20, 20]}
                className="h-full w-full border-0 mask-[radial-gradient(ellipse_at_center,white,transparent_75%)]"
                squaresClassName="stroke-border/40"
              />
            </div>

            <div className="relative z-10 w-full max-w-md space-y-8 text-center">
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  後輩の夢
                </h1>
                <p className="text-base text-muted-foreground">
                  ความฝันของน้องๆ - กรอกรหัสประจำตัวของน้องสิ
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label
                    htmlFor="camper-id"
                    className="text-sm font-medium text-foreground"
                  >
                    รหัสประจำตัวน้อง
                  </label>
                  <input
                    id="camper-id"
                    type="text"
                    value={camperId}
                    onChange={(e) => {
                      setCamperId(e.target.value)
                      if (viewState === "error") setViewState("idle")
                    }}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    placeholder="เช่น MK08"
                    aria-invalid={viewState === "error"}
                    aria-describedby={error ? "camper-id-error" : undefined}
                    className={cn(
                      "min-h-11 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground shadow-xs transition-colors outline-none",
                      "placeholder:text-muted-foreground",
                      "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
                      viewState === "error" &&
                        "border-destructive ring-3 ring-destructive/20"
                    )}
                  />
                  {error && (
                    <p
                      id="camper-id-error"
                      role="alert"
                      aria-live="polite"
                      className="text-sm text-destructive"
                    >
                      {error}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={viewState === "loading"}
                  className="h-11 w-full cursor-pointer text-base"
                >
                  {viewState === "loading" ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      กำลังค้นหา...
                    </>
                  ) : (
                    "เปิดความฝัน"
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        ) : (
          camper && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {showScrollHint && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none fixed inset-x-0 bottom-8 z-20 flex flex-col items-center gap-1 text-muted-foreground"
                >
                  <span className="text-base">เลื่อนลงสิ</span>
                  <ChevronDown className="size-12 animate-bounce" />
                </motion.div>
              )}

              <TextReveal>
                {`หวัดดี น้อง${camper.name}`}
              </TextReveal>         

              <TextReveal>
                {`น้องๆจำความฝันของตัวเองได้ไหม?`}
              </TextReveal>

              <TextReveal scrollHeight="120vh">
                {`น้อง ${camper.name} มีความฝันแบบไหนกันนะ?`}
              </TextReveal>

              <DreamWithComments
                dream={camper.dream}
                comments={camper.comments}
              />
              

              <TextReveal>
                {`งั้นหรอ...? เป็นความฝันที่ดีจัง :)`}
              </TextReveal>

              

              <footer className="py-16 text-center">
                <p className="text-sm text-muted-foreground">JWC14</p>
              </footer>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  )
}
