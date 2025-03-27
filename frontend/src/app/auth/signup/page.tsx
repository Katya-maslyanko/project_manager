import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация",
  description: "Страница регистрации",
};

export default function SignUp() {
  return <SignUpForm />;
}