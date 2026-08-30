"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

type DemoStep = "register" | "login";

type RegisteredAccount = {
  name: string;
  email: string;
  password: string;
};

export default function OnePasswordDemoPage() {
  const [step, setStep] = useState<DemoStep>("register");
  const [account, setAccount] = useState<RegisteredAccount | null>(null);
  const [message, setMessage] = useState("Create a demo account first, then log in to practice using 1Password.");
  const [loggedIn, setLoggedIn] = useState(false);

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = (data.get("name") as string | null)?.trim() ?? "";
    const email = (data.get("email") as string | null)?.trim() ?? "";
    const password = (data.get("password") as string | null) ?? "";

    if (!name || !email || !password.trim()) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setAccount({ name, email, password });
    setStep("login");
    setMessage(`Account created for ${name}. Now log in with the password you just saved in 1Password.`);
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = (data.get("email") as string | null)?.trim() ?? "";
    const password = (data.get("password") as string | null) ?? "";

    if (!email || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (account && (email !== account.email || password !== account.password)) {
      setMessage("Those credentials don't match the demo account you created. Let 1Password autofill them.");
      return;
    }

    setMessage(`Logged in as ${email}. 🎉`);
    setLoggedIn(true);
  }

  function startOver() {
    setAccount(null);
    setStep("register");
    setLoggedIn(false);
    setMessage("Create a demo account first, then log in to practice using 1Password.");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFFFF] text-[#4F5555]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#FF7A5A]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#4F5555]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,85,85,0.08),transparent_45%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-10 sm:px-6 sm:py-12">
        <header className="flex items-center justify-between gap-4 sm:gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#4F5555]/75">Vivira Health Lab GmbH (Public Trainings)</p>
            <h1 className="text-xl font-semibold tracking-tight text-[#4F5555] sm:text-2xl">1Password Demo</h1>
            <p className="max-w-xl text-sm text-[#4F5555]/90">A simple mock registration and login experience for training.</p>
          </div>
          <Image
            src="/Vivira-logo.svg"
            alt="Vivira logo"
            width={132}
            height={36}
            priority
            className="h-auto w-[112px] shrink-0 sm:w-[132px]"
          />
        </header>

        <section className="rounded-2xl border border-[#4F5555]/25 bg-[#FFFFFF]/95 p-7 shadow-[0_20px_60px_rgba(79,85,85,0.15)] backdrop-blur sm:p-10">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="flex items-center gap-3">
              <StepBadge active={step === "register"} done={step === "login"} label="1. Register" />
              <div className="h-px flex-1 bg-[#4F5555]/20" />
              <StepBadge active={step === "login"} done={false} label="2. Log in" />
            </div>

            {step === "register" ? (
              <form key="register" className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-[#4F5555]">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    autoComplete="off"
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-[#4F5555]/35 bg-[#FFFFFF] px-4 outline-none transition focus:border-[#FF7A5A]"
                    placeholder="Taylor Morgan"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="register-email" className="text-sm font-medium text-[#4F5555]">
                    Email
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-[#4F5555]/35 bg-[#FFFFFF] px-4 outline-none transition focus:border-[#FF7A5A]"
                    placeholder="taylor@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="register-password" className="text-sm font-medium text-[#4F5555]">
                    Password
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-[#4F5555]/35 bg-[#FFFFFF] px-4 outline-none transition focus:border-[#FF7A5A]"
                    placeholder="Let 1Password generate a strong password"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#0080A2] bg-[#0080A2] px-5 text-sm font-bold text-[#FFFFFF] transition hover:bg-[#0080A2]/90"
                >
                  Create Demo Account
                </button>
              </form>
            ) : (
              <form key="login" className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium text-[#4F5555]">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-[#4F5555]/35 bg-[#FFFFFF] px-4 outline-none transition focus:border-[#FF7A5A]"
                    placeholder="taylor@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-medium text-[#4F5555]">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-[#4F5555]/35 bg-[#FFFFFF] px-4 outline-none transition focus:border-[#FF7A5A]"
                    placeholder="Enter your saved password"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#0080A2] bg-[#0080A2] px-5 text-sm font-bold text-[#FFFFFF] transition hover:bg-[#0080A2]/90"
                >
                  Log In
                </button>

                <button
                  type="button"
                  onClick={startOver}
                  className="w-full text-center text-xs font-medium text-[#4F5555]/70 underline decoration-[#FF7A5A]/60 underline-offset-4 transition hover:text-[#4F5555]"
                >
                  Start over and register again
                </button>
              </form>
            )}

            <div className="rounded-xl border border-[#4F5555]/25 bg-[#FFFFFF] px-4 py-3 text-sm text-[#4F5555]/90">
              {message}
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => window.close()}
          className="inline-flex w-fit items-center text-sm font-medium text-[#4F5555]/90 underline decoration-[#FF7A5A]/70 underline-offset-4 transition hover:text-[#4F5555] hover:decoration-[#FF7A5A]"
        >
          Back to 1Password Training
        </button>
      </div>

      {loggedIn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#4F5555]/40 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-success-title"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-[#4F5555]/20 bg-[#FFFFFF] p-8 text-center shadow-[0_20px_60px_rgba(79,85,85,0.25)]">
            <button
              type="button"
              onClick={() => setLoggedIn(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#4F5555]/60 transition hover:bg-[#4F5555]/8 hover:text-[#4F5555]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1f9d58]/12">
              <svg className="h-7 w-7 text-[#1f9d58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 id="login-success-title" className="text-2xl font-semibold text-[#4F5555]">
              You&apos;re logged in! 🎉
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#4F5555]/85">
              Congratulations — you successfully logged in with the credentials you saved in 1Password. This is the
              end of the demo. You can now close this tab and return to the presentation.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function StepBadge({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-[#0080A2] bg-[#0080A2]/12 text-[#0080A2]"
          : done
            ? "border-[#1f9d58] bg-[#1f9d58]/12 text-[#1f9d58]"
            : "border-[#4F5555]/30 bg-[#4F5555]/5 text-[#4F5555]/70"
      }`}
    >
      {label}
    </span>
  );
}
