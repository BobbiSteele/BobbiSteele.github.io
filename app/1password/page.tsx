"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ReactNode } from "react";

type Slide = {
  title: string;
  articleParagraphs?: ReactNode[];
  points?: Array<{
    label: string;
    text: string;
  }>;
  quizQuestions?: Array<{
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
};

const slides: Slide[] = [
  {
    title: "What is a password manager?",
    articleParagraphs: [
      <>
        People tend to create{" "}
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">crackable passwords</span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-80 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            To defend against dictionary attacks, passwords must go beyond basic complexity filters. Even a complex-looking password is vulnerable if it consists of common words or phrases that hackers can systematically test.
          </span>
        </span>{" "}
        that are easy to
        hack into. Most people looking to hack into accounts use various dictionaries that are available online to try and
        figure out what passwords people have.
      </>,
      <>
        If your password is{" "}
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">Berlin2016InOmNiA!!</span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-80 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            This password is weak because it relies on common dictionary words like "Berlin" and "Insomnia." Adding a "!" doesn&apos;t help much, as hackers already expect and test for common symbols.
          </span>
        </span>
        , this will{" "}
        <span className="underline decoration-[#FF7A5A] decoration-2 underline-offset-2">only take a few minutes at most to be cracked</span> since these
        systems continue to attempt combinations until they succeed.
      </>,
      <>
        Even if you try to trick the system by replacing letters with numbers, if the spelling is still correct, hackers can do
        this as well. So, B3rl1n2016Ins0mNi4!! is also an insecure password as "1" is a common replacement for "i", "0" for
        "o" and "4" for "a". This writing form is called leet or 1337 where letters are replaced by numbers.
      </>,
      <>
        Stronger passwords would have intentional misspellings like{" "}
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">Be3rli1n2016Inns0pmNi4!!</span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-80 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            This password is more secure because it avoids standard dictionary words. By misspelling "Berlin" and "Insomnia" and substituting letters with numbers, you make it much harder for automated tools to guess.
          </span>
        </span>
      </>,
    ],
  },
  {
    title: "Why password managers matter",
    articleParagraphs: [
      <>
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">
            Each platform should use a different password,
          </span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-80 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            To minimize the impact of a security breach, avoid using the same password across multiple platforms. Unique passwords ensure that one compromised account doesn&apos;t grant access to your entire digital identity.
          </span>
        </span>
       and these should be changed, according to many cybersecurity experts, every 90 days. This makes remembering 20 or
        30 passwords quite hard, so most people have one simple password that they use for all of their accounts.
      </>,
      <>
        2 Factor authentication is not always a failsafe either. Hackers can transfer your SIM to another SIM, which gives
        them access to the 2FA application. Malware could also be downloaded onto a user&apos;s phone to intentionally target a
        user&apos;s swipes and cookies to gain access.
      </>,
      <>
        <span className="underline decoration-[#FF7A5A] decoration-2 underline-offset-2">
          Password management systems help mitigate some of the cybersecurity risks
        </span>{" "}
        that people have when navigating user login data on different applications and websites.
      </>,
    ],
  },
  {
    title: "How does it help?",
    articleParagraphs: [
      <>
        Password management systems help mitigate these risks by setting secure passwords (that can vary in length and
        difficulty based on what is needed). These are stored in vault.
      </>,
      <>
        You might think that a hacker could have even easier access to your data by specifically targeting password
        management systems, but these follow a principle called{" "}
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">
            Zero-Knowledge Encryption
          </span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-72 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            Zero-knowledge encryption means that no one but you, not even the company storing the data, can access and decrypt your data.
          </span>
        </span>
        .
      </>,
      <>
        So, that means you are able to store all of your passwords and passkeys in a digital vault that only you are able to
        read. You only need to remember one password and change it periodically in order to access the data.
      </>,
      <>
        That means the only way for a hacker to gain access to your data would be to take your computer while also knowing
        the password to your password management system.
      </>,
    ],
  },
  {
    title: "Quiz",
    quizQuestions: [
      {
        prompt: "What is a password manager?",
        options: [
          "A tool that stores and generates secure passwords",
          "A browser popup blocker",
          "A social media account backup",
          "A tool to speed up internet browsing",
        ],
        correctIndex: 0,
        explanation: "A password manager stores and helps generate strong, unique passwords for your accounts.",
      },
      {
        prompt: "Which one of the following is a strong password?",
        options: ["password123", "Summer2024!", "CorrectHorseBatteryStaple!92", "qwerty"],
        correctIndex: 2,
        explanation:
          "Long and unpredictable passphrases are generally stronger than short, common, or reused passwords.",
      },
      {
        prompt: "How often would you ideally change your passwords?",
        options: ["Once a week", "Every month", "Every three months", "Never"],
        correctIndex: 2,
        explanation: "For this training context, the target answer is every three months.",
      },
    ],
  },
];

export default function OnePasswordPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const totalSlides = slides.length;
  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / totalSlides) * 100;

  const goNext = () => {
    setSelectedAnswers({});
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const goPrev = () => {
    setSelectedAnswers({});
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const answerQuestion = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFFFF] text-[#4F5555]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#FF7A5A]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#4F5555]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,85,85,0.08),transparent_45%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-10 sm:px-6 sm:py-12">
        <header className="flex items-center justify-between gap-4 sm:gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#4F5555]/75">Vivira Health Lab GmbH (Public Trainings)</p>
            <h1 className="text-xl font-semibold tracking-tight text-[#4F5555] sm:text-2xl">1Password Training</h1>
            <p className="max-w-xl text-sm text-[#4F5555]/90">
              Best practices for creating and managing strong passwords with 1Password and why it matters for security.
            </p>
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

        <section className="min-h-[68vh] rounded-2xl border border-[#4F5555]/25 bg-[#FFFFFF]/95 p-7 shadow-[0_20px_60px_rgba(79,85,85,0.15)] backdrop-blur sm:p-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="rounded-full border border-[#FF7A5A] bg-[#FF7A5A]/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#4F5555]">
              Slide {currentSlide + 1}
            </span>
            <span className="text-sm text-[#4F5555]/80">{totalSlides} total</span>
          </div>

          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[#4F5555]/20">
            <div
              className="h-full rounded-full bg-[#FF7A5A] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-[#4F5555] sm:text-3xl md:text-4xl">
            {slide.title}
          </h2>

          {slide.articleParagraphs && (
            <article className="mx-auto mt-8 max-w-4xl rounded-xl border border-[#4F5555]/25 bg-[#FFFFFF] p-6 shadow-[0_10px_30px_rgba(79,85,85,0.10)]">
              <div className="space-y-5">
                {slide.articleParagraphs.map((paragraph, index) => (
                  <p key={index} className="text-base leading-8 text-[#4F5555]/90">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          )}

          {slide.quizQuestions && (
            <div className="mt-8 grid gap-5">
              {slide.quizQuestions.map((question, questionIndex) => {
                const selected = selectedAnswers[questionIndex];
                const answered = selected !== undefined;
                const isCorrect = answered && selected === question.correctIndex;

                return (
                  <article
                    key={question.prompt}
                    className="rounded-xl border border-[#4F5555]/25 bg-[#FFFFFF] p-4 shadow-[0_10px_30px_rgba(79,85,85,0.10)]"
                  >
                    <p className="text-base font-semibold text-[#4F5555]">{question.prompt}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => answerQuestion(questionIndex, optionIndex)}
                          className="rounded-md border border-[#4F5555]/35 bg-[#FFFFFF] px-3 py-2 text-left text-sm text-[#4F5555] transition hover:border-[#FF7A5A] hover:bg-[#FF7A5A]/8"
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {answered && (
                      <div
                        className={`mt-3 rounded-md border px-3 py-2 text-sm ${
                          isCorrect
                            ? "border-[#1f9d58] bg-[#1f9d58]/15 text-[#1f9d58]"
                            : "border-[#c62828] bg-[#c62828]/12 text-[#c62828]"
                        }`}
                      >
                        <p className="font-semibold">{isCorrect ? "Correct" : "Not quite"}</p>
                        <p>{question.explanation}</p>
                        {isCorrect && <p className="mt-1 text-base">🎉 🎉 🎉</p>}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={goPrev}
                className="rounded-md border border-[#4F5555]/45 bg-[#FFFFFF] px-4 py-2 text-sm text-[#4F5555] transition hover:border-[#4F5555] hover:bg-[#4F5555]/5"
              >
                Previous
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              className="rounded-md border border-[#0080A2] bg-[#0080A2] px-4 py-2 text-sm font-bold text-[#FFFFFF] transition hover:bg-[#0080A2]/90"
            >
              Next
            </button>
          </div>
        </section>

        <Link
          href="/"
          className="inline-flex w-fit items-center text-sm font-medium text-[#4F5555]/90 underline decoration-[#FF7A5A]/70 underline-offset-4 transition hover:text-[#4F5555] hover:decoration-[#FF7A5A]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
