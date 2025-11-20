"use client";

import UserForm from "@/components/user-form";
import TechnicianDashboard from "@/components/technician-dashboard";

export default function Home() {
  return (
    <div>
      <UserForm />
      <TechnicianDashboard />
    </div>
  );
}
