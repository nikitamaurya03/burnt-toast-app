"use client";

import { useState } from "react";
import LookbookChat from "@/components/LookbookChat";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import StyleSteps, { OnboardingData } from "@/components/onboarding/StyleSteps";
import IdentityReveal from "@/components/onboarding/IdentityReveal";
import { useToastieUser, ToastieUser } from "@/context/ToastieUserContext";
import { generateStyleIdentity } from "@/lib/styleIdentity";

type Phase = "loading" | "welcome" | "steps" | "reveal" | "chat";

export default function ChatPage() {
  const { user, isLoaded, setUser } = useToastieUser();
  const [phase, setPhase] = useState<Phase>("loading");
  const [userName, setUserName] = useState("");
  const [identity, setIdentity] = useState<{
    styleIdentity: string;
    colorPersonality: string;
    stylingDirection: string;
  } | null>(null);

  /* ── Pending user data (built across steps) ────────────────── */
  const [pendingData, setPendingData] = useState<OnboardingData | null>(null);

  /* ── Determine phase once localStorage hydrates ────────────── */
  const resolvedPhase = (() => {
    if (!isLoaded) return "loading";
    if (phase !== "loading") return phase;
    // First render after hydration
    if (user?.onboardingCompleted) return "chat";
    if (user?.name) return "steps";   // name saved but onboarding incomplete
    return "welcome";
  })();

  // Sync initial phase once
  if (isLoaded && phase === "loading" && resolvedPhase !== "loading") {
    setPhase(resolvedPhase);
  }

  /* ── Handlers ──────────────────────────────────────────────── */
  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setPhase("steps");
  };

  const handleStepsComplete = (data: OnboardingData) => {
    setPendingData(data);
    const result = generateStyleIdentity(data);
    setIdentity(result);

    // Save full user profile
    const fullUser: ToastieUser = {
      name: userName,
      onboardingCompleted: true,
      styleIdentity: result.styleIdentity,
      colorPersonality: result.colorPersonality,
      stylingDirection: result.stylingDirection,
      preferredStyles: data.preferredStyles,
      favoriteColors: data.favoriteColors,
      skinTone: data.skinTone,
      bodyShape: data.bodyShape,
      stylingNeeds: data.stylingNeeds,
      tags: result.tags,
      createdAt: Date.now(),
    };
    setUser(fullUser);
    setPhase("reveal");
  };

  const handleSkipOnboarding = () => {
    // Save minimal profile with defaults
    const fullUser: ToastieUser = {
      name: userName || "Friend",
      onboardingCompleted: true,
      styleIdentity: "Explorer",
      colorPersonality: "Versatile Mix",
      stylingDirection: "Everyday Elevated",
      preferredStyles: [],
      favoriteColors: [],
      skinTone: "",
      bodyShape: "not-sure",
      stylingNeeds: [],
      tags: [],
      createdAt: Date.now(),
    };
    setUser(fullUser);
    setPhase("chat");
  };

  const handleStartStyling = () => {
    setPhase("chat");
  };

  /* ── Render ────────────────────────────────────────────────── */
  if (resolvedPhase === "loading") {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "var(--cream)" }}
      >
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "2.5px solid var(--line)", borderTopColor: "var(--sage-deep)" }}
        />
      </div>
    );
  }

  if (resolvedPhase === "welcome") {
    return <WelcomeScreen onContinue={handleNameSubmit} />;
  }

  if (resolvedPhase === "steps") {
    return (
      <StyleSteps
        name={userName || user?.name || "Friend"}
        onComplete={handleStepsComplete}
        onSkipAll={handleSkipOnboarding}
      />
    );
  }

  if (resolvedPhase === "reveal" && identity) {
    return (
      <IdentityReveal
        name={userName || user?.name || "Friend"}
        styleIdentity={identity.styleIdentity}
        colorPersonality={identity.colorPersonality}
        stylingDirection={identity.stylingDirection}
        onStart={handleStartStyling}
      />
    );
  }

  return <LookbookChat />;
}
