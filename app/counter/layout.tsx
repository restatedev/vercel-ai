import { Tab } from "@/components/Tab";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex space-x-4 flex-col items-center justify-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <nav className="flex gap-4 m-4 mb-20">
        <Tab href="/counter/client" prefetch={false}>
          Client-side
        </Tab>
        <Tab href="/counter/server" prefetch={false}>
          Server-side
        </Tab>
      </nav>
      <Suspense fallback={<p>Loading...</p>}>
        <main>{children}</main>
      </Suspense>
    </section>
  );
}
