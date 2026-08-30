import type { Slide } from "./Presentation";

const loginSlide: Slide = {
  title: "Use 1Password to enter the training",
  passwordChallenge: {
    answer:
      "k8gPEsqw2i3rtPqEtLpXydYdaBcCwV2W9etrxowaaokKVmPTekTUD8CkBbp4qbyYDtTyF7BERdRLEs9kZ8aE9o9jhuJwqRBcATsa",
  },
};

const articleSlides: Slide[] = [
  {
    title: "What is a password manager?",
    articleParagraphs: [
      <>
        Unfortunately, many of us create{" "}
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">easily hackable passwords</span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-80 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            Cracking algorithms can compromise predictable passwords in seconds, especially when they are built from known words and patterns.
          </span>
        </span>{" "}
        that cracking algorithms can compromise in seconds. Hackers typically use automated dictionary attacks, rapidly
        testing variations of known words from multiple languages and appending predictable numbers or special characters
        to guess your credentials.
      </>,
      <>
        To make matters worse, because complex passwords are hard to remember, we often recycle the same one across
        multiple platforms. This means a hacker{" "}
        <span className="underline decoration-[#FF7A5A] decoration-2 underline-offset-2">only needs to crack your password once</span>{" "}
        to gain access to all of your online accounts.
      </>,
      <>
        Let&apos;s say your password is{" "}
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">Berlin2015StadtMitteMindSpace!!#.</span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-80 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            This is still weak because it relies on dictionary words, predictable date patterns, and common punctuation.
          </span>
        </span>
        {" "}It seems pretty safe, right? Even if an online password strength checker agrees with you, this is actually
        a weak password. Because it relies entirely on known dictionary words combined with a standard date and
        punctuation, it is the perfect target for a hacker&apos;s algorithm.
      </>,
      <>
        You might try to be clever and substitute numbers for letters, resulting in something like{" "}
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">B3rl1n2016St4dtMi773MindSpac3!!#.</span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-80 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            While admittedly a bit stronger, this is still highly vulnerable. Modern algorithms are programmed to
        instantly recognize common character replacements, such as using a "4" for an "a" or a "1" for an "l" or "i".
          </span>
        </span>
      </>,
      <>
        Truly strong passwords break away from recognizable patterns by using intentional misspellings. If we upgrade
        our example to make it{" "}
        <span className="underline decoration-[#FF7A5A] decoration-2 underline-offset-2">significantly harder to crack</span>, it would look more like this:
      </>,
      <>
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">B3erl1n2016St4addtMi773MyndSpaic3!!#</span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-80 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            This version is stronger because it avoids recognizable dictionary words and predictable patterns.
          </span>
        </span>
      </>,
    ],
  },
  {
    title: "Why password managers matter",
    articleParagraphs: [
      <>
        As mentioned earlier, reusing a single password creates a dangerous domino effect: if a hacker breaches one
        account, they potentially gain access to all of them. That&apos;s why{" "}
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">
            each platform needs its own unique password
          </span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-80 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            One compromised password should never unlock multiple tools. Unique passwords contain the blast radius of a breach.
          </span>
        </span>
        .
      </>,
      <>
        Furthermore, many cybersecurity experts recommend changing these passwords every 90 days. Given that the average
        tech worker relies on anywhere from 5 to 13 different platforms for their job, the math quickly becomes
        overwhelming.
      </>,
      <>
        It simply isn&apos;t realistic to expect anyone to memorize that many complex, regularly rotating passwords. As a
        result, people often resort to unsafe habits, like storing credentials in unencrypted note-taking apps or
        indefinitely recycling the same "strong" password across every tool without ever updating it.
      </>,
      <>
        You might assume that two-factor authentication (2FA) is a guaranteed failsafe, but hackers have developed
        methods to bypass this as well. For instance, attackers can execute a{" "}
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">SIM-swapping attack</span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-80 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            In a SIM-swap, an attacker convinces a carrier to transfer your number to their device, intercepting SMS-based authentication codes.
          </span>
        </span>
        , transferring your phone number to their own device to intercept your phone-based authentication codes. While
        2FA is a valuable and highly recommended barrier, it is not a bulletproof solution on its own.
      </>,
      <>
        <span className="underline decoration-[#FF7A5A] decoration-2 underline-offset-2">
          This is where password management systems come in
        </span>{" "}
        and help mitigate the widespread cybersecurity risks we face when juggling complex login credentials across
        dozens of different applications and websites.
      </>,
    ],
  },
  {
    title: "How does it help?",
    articleParagraphs: [
      <>
        Instead of relying on our memory, it is much easier and safer to use a password management system like 1Password.
        These tools help mitigate risks by automatically generating and{" "}
        <span className="underline decoration-[#FF7A5A] decoration-2 underline-offset-2">securely storing highly complex passwords</span>{" "}
        within an encrypted digital vault.
      </>,
      <>
        For the pessimists among us, you are probably assuming that hackers would simply target the password managers
        directly to strike gold. However, leading password management companies have already engineered a failsafe to
        prevent this exact scenario.
      </>,
      <>
        These systems operate on a core security principle called{" "}
        <span className="group relative inline-block align-middle">
          <span className="rounded-md bg-[#FF7A5A]/25 px-1.5 py-0.5 font-semibold text-[#4F5555]">
            Zero-Knowledge Encryption
          </span>
          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-72 -translate-x-1/2 rounded-lg border-2 border-[#FF7A5A]/60 bg-[#FFFFFF] p-3 text-sm leading-6 text-[#4F5555] shadow-[0_10px_30px_rgba(79,85,85,0.14),0_0_0_4px_rgba(255,122,90,0.10)] group-hover:block">
            Zero-knowledge encryption means that only you hold the key to see your passwords. Not even the company storing the data can access or decrypt it.
          </span>
        </span>
        .
      </>,
      <>
        This means that only you hold the key to see your passwords. No employee, developer, or system administrator can
        access your personal information, rendering the password management company{" "}
        <span className="underline decoration-[#FF7A5A] decoration-2 underline-offset-2">completely blind to the data stored inside your vault</span>.
      </>,
      <>
        Ultimately, your only responsibility is to memorize one strong master password—and update it periodically—to
        securely unlock your entire digital life.
      </>,
    ],
  },
];

const imageSlides: Slide[] = [
  { title: "Let's start using 1Password", imageUrl: "/1.png" },
  { title: "Make sure application is unlocked", imageUrl: "/2.png" },
  { title: "Adding a new item", imageUrl: "/3.png" },
  { title: "Creating your identity", imageUrl: "/4.png" },
  { title: "Enter your basic information", imageUrl: "/5.png" },
  { title: `Email is located under "Internet Identity"`, imageUrl: "/6.png" },
  { title: "You can now autofill information with your identity", imageUrl: "/7.png" },
  { title: "Now it's time to create your password", imageUrl: "/8.png" },
  { title: "Generating strong passwords", imageUrl: "/9.png" },
  { title: "Adding / Updating an item", imageUrl: "/10.png" },
  { title: "Well done! You've added your first password", imageUrl: "/11.png" },
  { title: "Sharing passwords with others", imageUrl: "/12.png" },
  { title: "Accidentally updated an existing password?", imageUrl: "/13.png" },
  { title: "Check the password before restoring", imageUrl: "/14.png" },
];

const demoSlide: Slide = {
  title: "Ready to test your skills?",
  cta: {
    heading: "Ready to put your 1Password skills to the test?",
    buttonText: "Let's go",
    buttonUrl: "https://bobbisteele.github.io/1password/1password-demo/",
  },
};

const quizSlide: Slide = {
  title: "Quiz",
  quizQuestions: [
    {
      prompt: "What is a password manager?",
      options: [
        "A tool that stores and generates secure passwords",
        "A note-taking app for passwords",
        "A required tool that was downloaded during the IT onboarding no one uses",
        "A tool to distract hackers from your real passwords",
      ],
      correctIndex: 0,
      explanation: "A password manager stores and helps generate strong, unique passwords for your accounts.",
    },
    {
      prompt: "Drag and drop these passwords from strongest to weakest.",
      rankOptions: ["Summer2024!", "qwerty", "xzk*YDB_dkm0dgq8ujn@", "passsword123", "SuMm3R2024!B3RLin"],
      correctOrder: ["xzk*YDB_dkm0dgq8ujn@", "SuMm3R2024!B3RLin", "Summer2024!", "passsword123", "qwerty"],
      explanation:
        "Correct ranking: xzk*YDB_dkm0dgq8ujn@, SuMm3R2024!B3RLin, Summer2024!, passsword123, qwerty.",
    },
    {
      prompt: "How often would you ideally change your passwords?",
      options: ["Once a week", "Every month", "Every three months", "Never"],
      correctIndex: 2,
      explanation: "We recommend changing your passwords every three months to minimize the risk of long-term exposure if a password is compromised. This can be done easily by updating a password in your 1Password account.",
    },
    {
      prompt: "What else can you do to protect your password?",
      options: [
        "Always enable 2-Factor Authentication (2FA)",
        "Never write your password down on note-taking apps or post-its",
        "Never use information like your birthday or pet's name as a password",
        "Use 1Password whenever possible to create strong passwords for you",
      ],
      correctIndexes: [0, 1, 2, 3],
      explanation: "All of these actions improve password security and reduce the risk of account compromise.",
    },
  ],
};

const congratsSlide: Slide = {
  title: "Congratulations!",
  confetti: true,
};

const certificateSlide: Slide = {
  title: "Generate your certificate",
  certificateGenerator: true,
};

const selectorSlide: Slide = {
  title: "Choose your training",
  pathSelector: {
    options: [
      {
        branch: "remote",
        label: "Remote / Self-guided",
      },
      {
        branch: "live",
        label: "Live training",
      },
    ],
  },
};

export const introSlides: Slide[] = [loginSlide, selectorSlide];

export const branches: Record<string, Slide[]> = {
  remote: [...articleSlides, ...imageSlides, demoSlide, quizSlide, congratsSlide, certificateSlide],
  live: [demoSlide, quizSlide, congratsSlide, certificateSlide],
};
