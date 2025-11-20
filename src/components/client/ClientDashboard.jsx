"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Sun,
  Moon,
  Banknote,
  Send,
  Save,
  Users,
} from "lucide-react"
import { RoleAwareSidebar } from "@/components/dashboard/RoleAwareSidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/components/theme-provider"
import { getSession } from "@/lib/auth-storage"

const dashboardTemplate = {
  heroSubtitle: "Review proposals, unlock talent, and keep budgets on track.",
  completion: 72,
  metrics: [
    {
      label: "Active projects",
      value: "6",
      trend: "2 awaiting review",
      icon: Briefcase,
    },
    {
      label: "Completed projects",
      value: "3",
      trend: "1 onboarding",
      icon: Sparkles,
    },
    {
      label: "Proposals Sent",
      value: "2",
      trend: "Vendors are responsive",
      icon: Clock,
    },
    {
      label: "Total Spend",
      value: "$ 24",
      trend: "Vendors are responsive",
      icon: Banknote,
    },
  ],
  pipelineTitle: "Hiring pipeline",
  pipelineDescription: "Where decisions are pending",
  pipeline: [
    {
      title: "Product launch video",
      client: "Internal",
      status: "Interviewing",
      due: "Pick this week",
    },
    {
      title: "Lifecycle email flows",
      client: "Internal",
      status: "Shortlist ready",
      due: "Review today",
    },
    {
      title: "Investor portal UI",
      client: "Internal",
      status: "Waiting on proposal",
      due: "ETA tomorrow",
    },
  ],
  availabilityTitle: "Budget allocation",
  availabilityDescription: "Hours committed by phase",
  availability: [
    { label: "Discovery & scoping", progress: 65 },
    { label: "Production", progress: 40 },
    { label: "QA & rollout", progress: 25 },
  ],
  messagesTitle: "Vendor updates",
  messagesDescription: "Latest freelancer communication",
  messages: [
    {
      from: "Nova Design Lab",
      company: "Vendor",
      excerpt: "Shared the figma handoff and notes for review.",
      time: "30m ago",
    },
    {
      from: "Atlas Collective",
      company: "Vendor",
      excerpt: "Budget tweak approved - sending updated agreement.",
      time: "2h ago",
    },
  ],
  remindersTitle: "Approvals",
  remindersDescription: "Actions to keep work moving",
  reminders: [
    { icon: Clock, title: "Approve Nova invoice", subtitle: "Due in 2 days" },
    {
      icon: Briefcase,
      title: "Review Atlas contract",
      subtitle: "Legal feedback ready",
    },
  ],
}

const PROPOSAL_STORAGE_KEYS = ["markify:savedProposal", "markify:pendingProposal", "pendingProposal", "savedProposal"]

const PRIMARY_PROPOSAL_STORAGE_KEY = PROPOSAL_STORAGE_KEYS[0]

const loadSavedProposalFromStorage = () => {
  if (typeof window === "undefined") {
    return null
  }

  for (const storageKey of PROPOSAL_STORAGE_KEYS) {
    const rawValue = window.localStorage.getItem(storageKey)
    if (!rawValue) continue
    try {
      return JSON.parse(rawValue)
    } catch {
      return { content: rawValue }
    }
  }

  return null
}

const persistSavedProposalToStorage = (proposal) => {
  if (typeof window === "undefined" || !proposal) {
    return
  }

  window.localStorage.setItem(PRIMARY_PROPOSAL_STORAGE_KEY, JSON.stringify(proposal))
}

const clearSavedProposalFromStorage = () => {
  if (typeof window === "undefined") {
    return
  }

  PROPOSAL_STORAGE_KEYS.forEach((storageKey) => window.localStorage.removeItem(storageKey))
}

const ClientDashboardContent = () => {
  const { state, toggleSidebar } = useSidebar()
  const navigate = useNavigate()
  const [sessionUser, setSessionUser] = useState(null)
  const [showBriefPrompt, setShowBriefPrompt] = useState(false)
  const [briefPromptDismissed, setBriefPromptDismissed] = useState(false)
  const [savedProposal, setSavedProposal] = useState(null)
  const [proposalDeliveryState, setProposalDeliveryState] = useState("idle")

  useEffect(() => {
    const session = getSession()
    setSessionUser(session?.user ?? null)
  }, [])

  useEffect(() => {
    if (!sessionUser || briefPromptDismissed) {
      setShowBriefPrompt(false)
      return
    }
    setShowBriefPrompt(true)
  }, [sessionUser, briefPromptDismissed])

  useEffect(() => {
    setSavedProposal(loadSavedProposalFromStorage())
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    const handleStorageChange = (event) => {
      if (event?.key && !PROPOSAL_STORAGE_KEYS.includes(event.key)) {
        return
      }
      setSavedProposal(loadSavedProposalFromStorage())
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    if (savedProposal && proposalDeliveryState === "idle") {
      setProposalDeliveryState("pending")
      return
    }

    if (!savedProposal && proposalDeliveryState === "pending") {
      setProposalDeliveryState("idle")
    }
  }, [savedProposal, proposalDeliveryState])

  const roleLabel = useMemo(() => {
    const baseRole = sessionUser?.role ?? "CLIENT"
    const normalized = baseRole.toLowerCase()
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }, [sessionUser])

  const dashboardLabel = sessionUser?.fullName?.trim()
    ? `${sessionUser.fullName.trim()}'s dashboard`
    : `${roleLabel} dashboard`

  const avatarInitials = useMemo(() => {
    if (sessionUser?.fullName) {
      const parts = sessionUser.fullName.trim().split(/\s+/)
      return (
        parts
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? "")
          .join("") || "CL"
      )
    }
    return "CL"
  }, [sessionUser])

  const template = useMemo(() => dashboardTemplate, [])

  const {
    heroSubtitle,
    completion: templateCompletion = 68,
    metrics = [],
    pipeline = [],
    pipelineTitle,
    pipelineDescription,
    availability = [],
    availabilityTitle,
    availabilityDescription,
    messages = [],
    messagesTitle,
    messagesDescription,
    reminders = [],
    remindersTitle,
    remindersDescription,
  } = template

  const [messagesFeed, setMessagesFeed] = useState(messages)

  useEffect(() => {
    setMessagesFeed(messages)
  }, [messages])

  const heroTitle = sessionUser?.fullName?.trim()
    ? `${sessionUser.fullName.split(" ")[0]}'s control room`
    : `${roleLabel} control room`
  const heroName = sessionUser?.fullName?.split(" ")[0] ?? roleLabel

  const savedProposalDetails = useMemo(() => {
    if (!savedProposal) {
      return null
    }

    const baseProposal =
      typeof savedProposal === "object" && savedProposal !== null ? savedProposal : { content: savedProposal }

    const projectTitle = baseProposal.projectTitle || baseProposal.title || baseProposal.project || "Untitled project"

    const service =
      baseProposal.service ||
      baseProposal.category ||
      baseProposal.professionalField ||
      baseProposal.serviceType ||
      "General services"

    const summary =
      baseProposal.summary ||
      baseProposal.executiveSummary ||
      baseProposal.description ||
      baseProposal.notes ||
      baseProposal.content ||
      ""

    const budgetValue = baseProposal.budget || baseProposal.budgetRange || baseProposal.estimate

    const preparedFor =
      baseProposal.preparedFor || baseProposal.client || baseProposal.clientName || sessionUser?.fullName || "Client"

    const createdAtValue =
      baseProposal.createdAt ||
      baseProposal.savedAt ||
      baseProposal.timestamp ||
      baseProposal.created_on ||
      baseProposal.created

    let createdAtDisplay = null
    if (createdAtValue) {
      const parsed = new Date(createdAtValue)
      createdAtDisplay = Number.isNaN(parsed.getTime()) ? String(createdAtValue) : parsed.toLocaleString()
    }

    const freelancerName =
      baseProposal.freelancerName ||
      baseProposal.targetFreelancer ||
      baseProposal.vendor ||
      baseProposal.recipient ||
      "Freelancer"

    return {
      projectTitle,
      service,
      preparedFor,
      summary,
      budget: typeof budgetValue === "number" ? `$${budgetValue.toLocaleString()}` : budgetValue,
      createdAtDisplay: createdAtDisplay ?? new Date().toLocaleString(),
      freelancerName,
      raw: baseProposal,
    }
  }, [savedProposal, sessionUser])

  const hasSavedProposal = Boolean(savedProposalDetails)

  const proposalStatusCopy = useMemo(() => {
    switch (proposalDeliveryState) {
      case "sent":
        return {
          title: "Proposal sent",
          body: "We added it to your vendor updates so you can track replies.",
        }
      case "cleared":
        return {
          title: "Proposal dismissed",
          body: "You cleared the saved content from this dashboard view.",
        }
      case "saved":
        return {
          title: "Saved to dashboard",
          body: "We'll keep it handy here until you decide to send it.",
        }
      case "pending":
        return {
          title: "Pending proposal",
          body: "Found a proposal you created before logging in.",
        }
      default:
        return {
          title: "No saved proposals",
          body: "Create a proposal and save it to find it here later.",
        }
    }
  }, [proposalDeliveryState])

  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === "dark"
  const themeIcon = isDarkMode ? Sun : Moon
  const toggleTheme = () => setTheme(isDarkMode ? "light" : "dark")
  const sidebarClosed = state === "collapsed"
  const SidebarToggleIcon = sidebarClosed ? PanelLeftOpen : PanelLeftClose
  const completionValue = Math.min(Math.max(templateCompletion || 0, 0), 100)

  const handleBriefRedirect = () => {
    setShowBriefPrompt(false)
    navigate("/client/briefs")
  }

  const handleBriefDismiss = () => {
    setBriefPromptDismissed(true)
    setShowBriefPrompt(false)
  }

  const handleClearSavedProposal = () => {
    clearSavedProposalFromStorage()
    setSavedProposal(null)
    setProposalDeliveryState("cleared")
  }

  const handleExploreFreelancers = () => {
    navigate("/service")
  }

  const handleSaveProposalToDashboard = () => {
    if (!savedProposal) {
      return
    }
    persistSavedProposalToStorage(savedProposal)
    setProposalDeliveryState("saved")
  }

  const handleSendProposal = () => {
    if (!savedProposalDetails) {
      return
    }

    setMessagesFeed((prev) => [
      {
        from: savedProposalDetails.freelancerName,
        company: savedProposalDetails.service,
        excerpt: savedProposalDetails.summary?.slice(0, 160) || "Proposal shared from dashboard.",
        time: "Just now",
      },
      ...prev,
    ])
    setProposalDeliveryState("sent")
  }

  return (
    <>
      <div className="relative flex flex-col gap-6 p-6">
        <div className="absolute left-6 top-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-border text-muted-foreground hover:text-foreground"
            onClick={toggleSidebar}
          >
            <SidebarToggleIcon className="size-4" />
            <span className="sr-only">{sidebarClosed ? "Open navigation" : "Close navigation"}</span>
          </Button>
          <div className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-muted-foreground">
            <span className="truncate">{dashboardLabel}</span>
            <ChevronRight className="size-3.5" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full border border-border text-muted-foreground hover:text-foreground"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {React.createElement(themeIcon, { className: "size-4" })}
          </Button>
        </div>
        <header className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white shadow-[0_35px_120px_-40px_rgba(0,0,0,0.8)]">
          <div className="relative z-10 flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-5">
              <Badge className="w-fit border border-white/10 bg-white/5 text-xs uppercase tracking-[0.4em] text-white/70">
                {heroTitle}
              </Badge>
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-primary/80">Client control</p>
                <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  Welcome back, <span className="text-primary">{heroName}</span>
                </h1>
                <p className="mt-3 max-w-2xl text-base text-white/70">{heroSubtitle}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="secondary"
                size="lg"
                className="h-12 gap-2 rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/20"
                onClick={handleSaveProposalToDashboard}
                disabled={!hasSavedProposal}
              >
                <Save className="h-4 w-4" />
                Save proposal
              </Button>
              <Button
                size="lg"
                className="h-12 gap-2 rounded-full bg-primary text-black hover:bg-primary/90"
                onClick={handleExploreFreelancers}
              >
                <Sparkles className="h-4 w-4" />
                Find freelancers
              </Button>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(circle_at_top,_rgba(253,200,0,0.25),_transparent_55%)]" />
        </header>

        <section className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card
                key={metric.label}
                className="border border-white/5 bg-gradient-to-br from-slate-950 to-slate-900 text-white shadow-[0_30px_80px_-45px_rgba(0,0,0,0.9)] dark:border-white/10"
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm uppercase tracking-[0.35em] text-white/50">{metric.label}</p>
                    </div>
                    <Badge className="border-none bg-white/10 text-xs text-white/70">{dashboardLabel}</Badge>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold">{metric.value}</p>
                    <p className="text-sm text-white/70">{metric.trend}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="overflow-hidden border border-primary/30 bg-gradient-to-b from-[#120c04] via-[#050505] to-[#050505] text-white shadow-[0_45px_120px_-60px_rgba(253,200,0,0.45)]">
            <CardHeader className="space-y-4 border-b border-white/5 bg-black/20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-primary/70">Saved proposal</p>
                  <CardTitle className="text-2xl font-semibold text-white">Saved proposal</CardTitle>
                  <CardDescription className="text-xs text-white/60">
                    {hasSavedProposal
                      ? `Service: ${savedProposalDetails.service} • Created: ${savedProposalDetails.createdAtDisplay}`
                      : "Save a proposal before logging in and it will appear here."}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="border border-primary/50 bg-primary/20 text-primary">Ready to send</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white"
                    onClick={handleClearSavedProposal}
                    disabled={!hasSavedProposal}
                    aria-label="Clear saved proposal"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="rounded-2xl border border-primary/20 bg-black/30 p-5 font-mono text-sm text-primary/80">
                <p className="text-[11px] uppercase tracking-[0.6em] text-primary/60">--- Project proposal ---</p>
                {hasSavedProposal ? (
                  <div className="mt-4 space-y-3 text-white">
                    <div>
                      <p className="text-lg font-semibold">{savedProposalDetails.projectTitle}</p>
                      <p className="text-xs text-white/60">Development & Tech</p>
                    </div>
                    <div className="grid gap-2 text-sm text-white/80 sm:grid-cols-2">
                      <div>
                        <span className="text-white/50">Prepared for:</span>{" "}
                        <span className="font-semibold text-white">{savedProposalDetails.preparedFor}</span>
                      </div>
                      {savedProposalDetails.budget ? (
                        <div>
                          <span className="text-white/50">Budget:</span>{" "}
                          <span className="font-semibold">{savedProposalDetails.budget}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-1 rounded-xl bg-black/50 p-4 text-sm leading-relaxed text-white/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/60">
                        Executive summary
                      </p>
                      <p className="max-h-48 overflow-y-auto pr-2 text-white/80 scrollbar-thin">
                        {savedProposalDetails.summary || "Proposal details recovered from your previous session."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-white/70">
                    Draft a proposal from the services page and we'll keep a copy here so you can send it once you sign in.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 flex-1 min-w-[140px] gap-2 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                  onClick={handleExploreFreelancers}
                >
                  <Users className="h-4 w-4" />
                  Find talent
                </Button>
                <Button
                  size="lg"
                  className="h-11 flex-1 min-w-[140px] gap-2 rounded-full bg-primary text-black hover:bg-primary/90 disabled:opacity-30"
                  onClick={handleSendProposal}
                  disabled={!hasSavedProposal}
                >
                  <Send className="h-4 w-4" />
                  Send to freelancer
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-11 flex-1 min-w-[120px] gap-2 rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
                  onClick={handleSaveProposalToDashboard}
                  disabled={!hasSavedProposal}
                >
                  <Save className="h-4 w-4" />
                  Save draft
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col border border-primary/20 bg-gradient-to-b from-[#1b1206] via-[#0b0905] to-[#050505] text-white">
            <CardContent className="flex flex-1 flex-col justify-center gap-4 p-6">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.4em] text-primary/70">Status</p>
                <p className="text-xl font-semibold">{proposalStatusCopy.title}</p>
              </div>
              <p className="text-sm text-white/70">{proposalStatusCopy.body}</p>
              {hasSavedProposal ? (
                <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Pending proposal detected</span>
                  </div>
                  <p className="text-xs text-white/60">
                    Ready to send to <span className="text-white">{savedProposalDetails.freelancerName}</span>.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/20 p-4 text-xs text-white/60">
                  You have no saved proposals yet. Draft one to unlock quick send actions.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

      </div>
    </>
  )
}

const ClientDashboard = () => {
  return (
    <RoleAwareSidebar>
      <ClientDashboardContent />
    </RoleAwareSidebar>
  )
}

export default ClientDashboard
