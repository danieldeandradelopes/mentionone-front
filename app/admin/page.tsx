import Feedback from "@/app/entities/Feedback";
import LogoutButton from "./LogoutButton";
import FeedbackList from "./FeedbackList";

async function getFeedbacks(): Promise<Feedback[]> {
  const res = await fetch("http://localhost:3000/api/feedback", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return await res.json();
}

export default async function AdminPage() {
  const feedbacks = await getFeedbacks();

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-4 md:px-8 py-4">
      <header className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center sm:text-left">
          Painel Admin
        </h1>
        <LogoutButton />
      </header>
      <main className="max-w-3xl mx-auto w-full">
        <FeedbackList initialFeedbacks={feedbacks} />
      </main>
    </div>
  );
}
