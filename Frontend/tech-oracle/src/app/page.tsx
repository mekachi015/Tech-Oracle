import Image from "next/image";
import UserForm from "@/components/user-form";
import TechnicianDashboard from "@/components/technician-dashboard";
import ClientWrapper from "./clientWrapper";
export default function Home() {
  return (
    <ClientWrapper>
    <div>
      <UserForm />
      <TechnicianDashboard />
    </div>
    </ClientWrapper>  );
}
