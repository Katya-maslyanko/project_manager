import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход в систему",
  description: "Страница входа в систему",
};

export default function SignIn() {
  return <SignInForm />;
}