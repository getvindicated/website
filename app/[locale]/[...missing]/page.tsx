import { notFound } from "next/navigation";

// Any unknown address under a language (/es/whatever) shows that
// language's 404 page instead of the bare one.
export default function Missing() {
  notFound();
}
