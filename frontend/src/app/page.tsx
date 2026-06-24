import { HomePageContent } from "@/components/home-page-content";

export default function HomePage() {
  return (
    <div
      className="w-screen max-w-none px-0"
      style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
    >
      <HomePageContent />
    </div>
  );
}
