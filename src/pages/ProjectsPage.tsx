import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import ChatHistoryPanel from "@/components/ChatHistoryPanel";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Your Projects
            </h1>
            <p className="text-muted-foreground">
              View and manage your repair history and chat sessions
            </p>
          </div>

          <ChatHistoryPanel />
        </div>
      </main>

      <Footer />
    </div>
  );
}
