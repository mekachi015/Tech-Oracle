"use client"
import dynamic from 'next/dynamic';
import ClientWrapper from "./clientWrapper";

const UserForm = dynamic(() => import("@/components/user-form"), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
});

export default function Home() {
  return (
    <ClientWrapper>
      <UserForm />
    </ClientWrapper>
  );
}
