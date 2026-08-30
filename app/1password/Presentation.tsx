"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toPng } from "html-to-image";
import CertificateTemplate from "./1password-certificate/src/imports/15/15";

export type MultipleChoiceQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type RankingQuestion = {
  prompt: string;
  rankOptions: string[];
  correctOrder: string[];
  explanation: string;
};

export type MultiSelectQuestion = {
  prompt: string;
  options: string[];
  correctIndexes: number[];
  explanation: string;
};

export type QuizQuestion = MultipleChoiceQuestion | RankingQuestion | MultiSelectQuestion;

export type Slide = {
  title: string;
  imageUrl?: string;
  videoEmbedUrl?: string;
  videoPaddingBottom?: string;
  passwordChallenge?: {
    prompt?: string;
    answer: string;
    placeholder?: string;
  };
  articleParagraphs?: ReactNode[];
  cta?: {
    heading: string;
    buttonText: string;
    buttonUrl: string;
  };
  confetti?: boolean;
  certificateGenerator?: boolean;
  points?: Array<{
    label: string;
    text: string;
  }>;
  quizQuestions?: QuizQuestion[];
  pathSelector?: {
    options: Array<{
      branch: string;
      label: string;
      description?: string;
    }>;
  };
};

const CERT_W = 1920;
const CERT_H = 1362;
const NAME_TOP = 789;
const DATE_TOP = 1044;
const DATE_CENTER_X = 750;
const DATE_WIDTH = 280;

type TrainingPresentationProps = {
  introSlides: Slide[];
  branches: Record<string, Slide[]>;
  title: string;
  subtitle: string;
};

export function TrainingPresentation({ introSlides, branches, title, subtitle }: TrainingPresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [branch, setBranch] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [multiSelectedAnswers, setMultiSelectedAnswers] = useState<Record<number, number[]>>({});
  const [rankedAnswers, setRankedAnswers] = useState<Record<number, string[]>>({});
  const [dragging, setDragging] = useState<{ questionIndex: number; itemIndex: number } | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [issuedName, setIssuedName] = useState("");
  const [certificateReady, setCertificateReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fullCertRef = useRef<HTMLDivElement>(null);
  const slides = useMemo(
    () => [...introSlides, ...(branch ? branches[branch] ?? [] : [])],
    [introSlides, branches, branch],
  );
  const totalSlides = slides.length;
  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / totalSlides) * 100;
  const passwordRequired = !!slide.passwordChallenge;
  const isPasswordCorrect = !passwordRequired || passwordInput === slide.passwordChallenge?.answer;
  const pathSelectionRequired = !!slide.pathSelector && !branch;
  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const isRankingQuestion = (question: QuizQuestion): question is RankingQuestion => {
    return "rankOptions" in question;
  };

  const isMultiSelectQuestion = (question: QuizQuestion): question is MultiSelectQuestion => {
    return "correctIndexes" in question;
  };

  const isRankingCorrect = (questionIndex: number, question: RankingQuestion) => {
    const currentOrder = rankedAnswers[questionIndex] ?? question.rankOptions;

    return (
      currentOrder.length === question.correctOrder.length &&
      currentOrder.every((value, idx) => value === question.correctOrder[idx])
    );
  };

  const allQuizCorrect =
    !slide.quizQuestions ||
    slide.quizQuestions.every((q, i) => {
      if (isRankingQuestion(q)) {
        return isRankingCorrect(i, q);
      }

      if (isMultiSelectQuestion(q)) {
        const selected = multiSelectedAnswers[i] ?? [];
        const sortedSelected = [...selected].sort((a, b) => a - b);
        const sortedCorrect = [...q.correctIndexes].sort((a, b) => a - b);

        return (
          sortedSelected.length === sortedCorrect.length &&
          sortedSelected.every((value, idx) => value === sortedCorrect[idx])
        );
      }

      return selectedAnswers[i] === q.correctIndex;
    });

  const goNext = () => {
    setPasswordInput("");
    setSelectedAnswers({});
    setMultiSelectedAnswers({});
    setRankedAnswers({});
    setDragging(null);
    setQuizChecked(false);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const goPrev = () => {
    setPasswordInput("");
    setSelectedAnswers({});
    setMultiSelectedAnswers({});
    setRankedAnswers({});
    setDragging(null);
    setQuizChecked(false);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const selectBranch = (nextBranch: string) => {
    setBranch(nextBranch);
    setPasswordInput("");
    setSelectedAnswers({});
    setMultiSelectedAnswers({});
    setRankedAnswers({});
    setDragging(null);
    setQuizChecked(false);
    setCurrentSlide((prev) => prev + 1);
  };

  const answerQuestion = (questionIndex: number, optionIndex: number) => {
    setQuizChecked(false);
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const toggleMultiSelectAnswer = (questionIndex: number, optionIndex: number) => {
    setQuizChecked(false);
    setMultiSelectedAnswers((prev) => {
      const current = prev[questionIndex] ?? [];
      const hasOption = current.includes(optionIndex);

      return {
        ...prev,
        [questionIndex]: hasOption
          ? current.filter((index) => index !== optionIndex)
          : [...current, optionIndex],
      };
    });
  };

  const checkQuizAnswers = () => {
    setQuizChecked(true);
  };

  const generateCertificate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = fullName.trim();

    if (!trimmed) {
      return;
    }

    setIssuedName(trimmed);
    setCertificateReady(true);
  };

  const downloadCertificatePng = async () => {
    if (!fullCertRef.current || !issuedName) {
      return;
    }

    setDownloading(true);

    try {
      await document.fonts.ready;

      const dataUrl = await toPng(fullCertRef.current, {
        width: CERT_W,
        height: CERT_H,
        pixelRatio: 1,
        style: { opacity: "1" },
      });

      const anchor = document.createElement("a");
      anchor.download = `certificate-${issuedName.toLowerCase().replace(/\s+/g, "-")}.png`;
      anchor.href = dataUrl;
      anchor.click();
    } catch (error) {
      console.error("PNG export failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  const reorderRankingQuestion = (questionIndex: number, toIndex: number) => {
    if (!slide.quizQuestions || !dragging || dragging.questionIndex !== questionIndex) {
      return;
    }

    const question = slide.quizQuestions[questionIndex];
    if (!question || !isRankingQuestion(question)) {
      return;
    }

    const currentOrder = rankedAnswers[questionIndex] ?? question.rankOptions;
    const fromIndex = dragging.itemIndex;

    if (fromIndex === toIndex) {
      return;
    }

    const updated = [...currentOrder];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    setRankedAnswers((prev) => ({
      ...prev,
      [questionIndex]: updated,
    }));
    setDragging({ questionIndex, itemIndex: toIndex });
    setQuizChecked(false);
  };

  const renderCertificateGenerator = () => (
    <div className="mt-8 flex flex-col gap-8">
      {certificateReady && issuedName && (
        <div
          ref={fullCertRef}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: CERT_W,
            height: CERT_H,
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <CertificateTemplate />
          <NameOverlay name={issuedName} />
          <DateOverlay date={todayLabel} />
        </div>
      )}

      {!certificateReady ? (
        <div className="max-w-lg rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-1 text-2xl font-bold text-[#1a1815]" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Generate a Certificate
          </h2>
          <p className="mb-7 text-sm text-[#717182]">
            Enter the recipient&apos;s name. The current date is applied automatically.
          </p>

          <form onSubmit={generateCertificate} className="flex flex-col gap-5">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#9a9a90]">
                Recipient Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="e.g. Jane Smith"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-[#1a1815] outline-none transition placeholder:text-gray-300 focus:border-[#F28262] focus:ring-2 focus:ring-[#F28262]/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#9a9a90]">
                Issue Date
              </label>
              <div className="select-none rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-base text-[#1a1815]">
                {todayLabel}
              </div>
            </div>

            <button
              type="submit"
              disabled={!fullName.trim()}
              className="mt-1 rounded-xl bg-[#F28262] py-3 text-base font-bold text-white transition-all hover:bg-[#e0704d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Generate Certificate
            </button>
          </form>
        </div>
      ) : null}

      {certificateReady && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1a1815]" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                Preview
              </h3>
              <p className="mt-0.5 text-xs text-[#717182]">
                Issued to <span className="font-semibold text-[#1a1815]">{issuedName || "Your Name"}</span>
                {" - "}
                {todayLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={downloadCertificatePng}
              disabled={downloading}
              className="flex items-center gap-2 rounded-xl bg-[#1a1815] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2e2d29] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PNG
                </>
              )}
            </button>
          </div>

          <div
            className="self-start overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/5"
            style={{ width: CERT_W * 0.5, height: CERT_H * 0.5 }}
          >
            <div
              style={{
                width: CERT_W,
                height: CERT_H,
                transform: "scale(0.5)",
                transformOrigin: "top left",
                position: "relative",
              }}
            >
              <CertificateTemplate />
              <NameOverlay name={issuedName || "Your Name"} />
              <DateOverlay date={todayLabel} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

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
            <h1 className="text-xl font-semibold tracking-tight text-[#4F5555] sm:text-2xl">{title}</h1>
            <p className="max-w-xl text-sm text-[#4F5555]/90">{subtitle}</p>
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

        <section className="flex min-h-[68vh] flex-col rounded-2xl border border-[#4F5555]/25 bg-[#FFFFFF]/95 p-7 shadow-[0_20px_60px_rgba(79,85,85,0.15)] backdrop-blur sm:p-10">
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

          {slide.passwordChallenge && (
            <div className="my-auto flex flex-1 items-center justify-center">
              <div className="w-full max-w-xl">
                {slide.passwordChallenge.prompt && (
                  <p className="mb-4 text-center text-base text-[#4F5555]/90">{slide.passwordChallenge.prompt}</p>
                )}
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && isPasswordCorrect) {
                      goNext();
                    }
                  }}
                  placeholder={slide.passwordChallenge.placeholder}
                  className="w-full rounded-md border border-[#4F5555]/35 bg-[#FFFFFF] px-3 py-2 text-sm text-[#4F5555] outline-none transition focus:border-[#0080A2] focus:ring-2 focus:ring-[#0080A2]/30"
                />
              </div>
            </div>
          )}

          {slide.pathSelector && (
            <div className="my-auto flex flex-1 items-center justify-center">
              <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
                {slide.pathSelector.options.map((option) => (
                  <button
                    key={option.branch}
                    type="button"
                    onClick={() => selectBranch(option.branch)}
                    className="group flex h-full flex-col rounded-xl border border-[#4F5555]/25 bg-[#FFFFFF] p-6 text-left shadow-[0_10px_30px_rgba(79,85,85,0.10)] transition hover:border-[#0080A2] hover:shadow-[0_14px_40px_rgba(0,128,162,0.18)]"
                  >
                    <span className="text-lg font-semibold text-[#4F5555] group-hover:text-[#0080A2]">{option.label}</span>
                    <span className="mt-4 inline-flex items-center text-sm font-bold text-[#0080A2]">
                      Start
                      <svg className="ml-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {slide.certificateGenerator && renderCertificateGenerator()}

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
                const isRanking = isRankingQuestion(question);
                const isMultiSelect = isMultiSelectQuestion(question);
                const selected = !isRanking && !isMultiSelect ? selectedAnswers[questionIndex] : undefined;
                const selectedMultiple = isMultiSelect ? multiSelectedAnswers[questionIndex] ?? [] : [];
                const isCorrect = isRanking
                  ? isRankingCorrect(questionIndex, question)
                  : isMultiSelect
                    ? [...selectedMultiple].sort((a, b) => a - b).every((value, idx) => value === [...question.correctIndexes].sort((a, b) => a - b)[idx]) &&
                      selectedMultiple.length === question.correctIndexes.length
                  : selected === question.correctIndex;
                const rankingItems = isRanking ? rankedAnswers[questionIndex] ?? question.rankOptions : [];

                return (
                  <article
                    key={question.prompt}
                    className="rounded-xl border border-[#4F5555]/25 bg-[#FFFFFF] p-4 shadow-[0_10px_30px_rgba(79,85,85,0.10)]"
                  >
                    <p className="text-base font-semibold text-[#4F5555]">{question.prompt}</p>
                    {isRanking ? (
                      <div className="mt-3 grid gap-2">
                        <p className="text-xs uppercase tracking-[0.14em] text-[#4F5555]/70">Strongest at top, weakest at bottom</p>
                        {rankingItems.map((option, optionIndex) => (
                          <button
                            key={option}
                            type="button"
                            draggable
                            onDragStart={() => setDragging({ questionIndex, itemIndex: optionIndex })}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => reorderRankingQuestion(questionIndex, optionIndex)}
                            onDragEnd={() => setDragging(null)}
                            className="rounded-md border border-[#4F5555]/35 bg-[#FFFFFF] px-3 py-2 text-left text-sm text-[#4F5555] transition hover:border-[#FF7A5A] hover:bg-[#FF7A5A]/8"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : isMultiSelect ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {question.options.map((option, optionIndex) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleMultiSelectAnswer(questionIndex, optionIndex)}
                            className={`rounded-md border px-3 py-2 text-left text-sm text-[#4F5555] transition ${
                              selectedMultiple.includes(optionIndex)
                                ? "border-[#0080A2] bg-[#0080A2]/12 ring-2 ring-[#0080A2]/30"
                                : "border-[#4F5555]/35 bg-[#FFFFFF] hover:border-[#FF7A5A] hover:bg-[#FF7A5A]/8"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {question.options.map((option, optionIndex) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => answerQuestion(questionIndex, optionIndex)}
                            className={`rounded-md border px-3 py-2 text-left text-sm text-[#4F5555] transition ${
                              selected === optionIndex
                                ? "border-[#0080A2] bg-[#0080A2]/12 ring-2 ring-[#0080A2]/30"
                                : "border-[#4F5555]/35 bg-[#FFFFFF] hover:border-[#FF7A5A] hover:bg-[#FF7A5A]/8"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {quizChecked && (
                      <div
                        className={`mt-3 rounded-md border px-3 py-2 text-sm ${
                          isCorrect
                            ? "border-[#1f9d58] bg-[#1f9d58]/15 text-[#1f9d58]"
                            : "border-[#c62828] bg-[#c62828]/12 text-[#c62828]"
                        }`}
                      >
                        {!isRanking && !isMultiSelect && selected === undefined ? (
                          <>
                            <p className="font-semibold">Answer missing</p>
                            <p>Please choose an answer, then check again.</p>
                          </>
                        ) : (isMultiSelect && selectedMultiple.length === 0) ? (
                          <>
                            <p className="font-semibold">Answer missing</p>
                            <p>Please select one or more answers, then check again.</p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold">{isCorrect ? "Correct" : "Not quite"}</p>
                            <p>{question.explanation}</p>
                            {isCorrect && <p className="mt-1 text-base">🎉 🎉 🎉</p>}
                          </>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={checkQuizAnswers}
                  className="rounded-md border border-[#4F5555]/45 bg-[#FFFFFF] px-4 py-2 text-sm font-semibold text-[#4F5555] transition hover:border-[#4F5555] hover:bg-[#4F5555]/5"
                >
                  Check answers
                </button>
              </div>
            </div>
          )}

          {slide.imageUrl && (
            <div className="mx-auto mt-8 w-full max-w-6xl overflow-hidden rounded-xl border border-[#4F5555]/25 bg-[#FFFFFF] shadow-[0_10px_30px_rgba(79,85,85,0.10)]">
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                width={1920}
                height={1080}
                className="h-auto w-full"
                priority
              />
            </div>
          )}

          {slide.cta && (
            <div className="mx-auto my-auto flex w-full max-w-4xl items-center justify-center">
              <div className="rounded-xl border border-[#4F5555]/25 bg-[#FFFFFF] p-8 shadow-[0_10px_30px_rgba(79,85,85,0.10)] text-center">
                <h2 className="text-2xl font-semibold text-[#4F5555] sm:text-3xl">
                  {slide.cta.heading}
                </h2>
                <button
                  type="button"
                  onClick={() => window.open(slide.cta!.buttonUrl, "_blank")}
                  className="mt-6 inline-block rounded-full bg-[#0080A2] px-6 py-3 font-bold text-[#FFFFFF] transition hover:bg-[#0080A2]/90"
                >
                  {slide.cta.buttonText}
                </button>
              </div>
            </div>
          )}

          {slide.videoEmbedUrl && (
            <div className="mx-auto mt-8 w-full max-w-4xl overflow-hidden rounded-xl border border-[#4F5555]/25 bg-[#FFFFFF] shadow-[0_10px_30px_rgba(79,85,85,0.10)]">
              <div className="relative w-full" style={{ paddingBottom: slide.videoPaddingBottom ?? "56.25%" }}>
                <iframe
                  src={slide.videoEmbedUrl}
                  title="Embedded training video"
                  className="absolute left-0 top-0 h-full w-full"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {slide.confetti && (
            <div className="pointer-events-none fixed inset-0">
              <style>{`
                @keyframes fall {
                  to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                  }
                }
                .confetti-piece {
                  position: fixed;
                  width: 10px;
                  height: 10px;
                  animation: fall 3s ease-in forwards;
                }
              `}</style>
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: Math.random() * 100 + "%",
                    top: "-10px",
                    backgroundColor: ["#FF7A5A", "#0080A2", "#4F5555", "#FFFFFF"][Math.floor(Math.random() * 4)],
                    animationDelay: Math.random() * 0.5 + "s",
                    borderRadius: Math.random() > 0.5 ? "50%" : "0",
                  }}
                />
              ))}
            </div>
          )}

          {slide.confetti && (
            <div className="mx-auto my-auto flex w-full max-w-4xl flex-1 items-center justify-center text-center">
              <h2 className="text-3xl font-bold text-[#4F5555] sm:text-5xl">
                🎉 Congratulations! 🎉
              </h2>
            </div>
          )}

          <div className="mt-auto flex flex-wrap justify-end gap-3 pt-8">
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
              disabled={(!!slide.quizQuestions && (!quizChecked || !allQuizCorrect)) || (passwordRequired && !isPasswordCorrect)}
              hidden={passwordRequired || pathSelectionRequired}
              className="rounded-md border border-[#0080A2] bg-[#0080A2] px-4 py-2 text-sm font-bold text-[#FFFFFF] transition hover:bg-[#0080A2]/90 disabled:cursor-not-allowed disabled:opacity-40"
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

function NameOverlay({ name }: { name: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: NAME_TOP,
        transform: "translateX(-50%)",
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 80,
        fontWeight: 600,
        color: "#1a1815",
        whiteSpace: "nowrap",
        textAlign: "center",
        lineHeight: 1.3,
        pointerEvents: "none",
      }}
    >
      {name}
    </div>
  );
}

function DateOverlay({ date }: { date: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: DATE_CENTER_X - DATE_WIDTH / 2,
        top: DATE_TOP,
        width: DATE_WIDTH,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 50,
        fontWeight: 400,
        color: "#1a1815",
        textAlign: "center",
        lineHeight: 1.5,
        pointerEvents: "none",
      }}
    >
      {date}
    </div>
  );
}
