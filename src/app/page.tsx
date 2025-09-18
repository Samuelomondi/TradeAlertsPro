import Dashboard from "@/components/dashboard";
import BotInfo from "@/components/bot-info";

export default function Home() {
  return (
    <main>
      <Dashboard botInfo={<BotInfo />} />
    </main>
  );
}
