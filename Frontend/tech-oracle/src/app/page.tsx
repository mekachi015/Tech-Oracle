"use client"
import UserForm from "@/components/user-form";
import ClientWrapper from "./clientWrapper";

export default function Home() {
  return (
    <ClientWrapper>
      <UserForm />
    </ClientWrapper>
  );
}
