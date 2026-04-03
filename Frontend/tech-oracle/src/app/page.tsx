"use client"
import UserForm from "@/components/user-form";
import HeroSection from "@/components/HeroSection";
import ClientWrapper from "./clientWrapper";

export default function Home() {
  return (
    <>
      <HeroSection formSectionId="repair-form" />
      <div id="repair-form">
        <ClientWrapper>
          <UserForm />
        </ClientWrapper>
      </div>
    </>
  );
}