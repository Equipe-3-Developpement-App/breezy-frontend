import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirecting the user immediately to the main authentication landing view
  redirect("/auth");
}