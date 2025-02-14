import { TabTracker } from "@/components/TabTracker";
import { WindowFocusTracker } from "@/components/WindowFocusTracker";
import { PageTracker } from "@/components/PageTracker";

export default function Home() {
  return (
    <main>
      <h1>Focus Tracker</h1>
      <TabTracker />
      <WindowFocusTracker />
      <PageTracker />
    </main>
  );
}
