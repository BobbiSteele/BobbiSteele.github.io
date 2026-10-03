"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Old landing page; its categories now live under /writing.
export default function GhostwritingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/writing/");
  }, [router]);

  return null;
}
