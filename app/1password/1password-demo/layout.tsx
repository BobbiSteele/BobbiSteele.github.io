import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1Password Training Demo",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
