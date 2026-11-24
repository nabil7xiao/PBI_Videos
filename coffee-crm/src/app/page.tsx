import { redirect } from "next/navigation";

// The home address simply opens the dashboard (or the login page if needed).
export default function Home() {
  redirect("/dashboard");
}
