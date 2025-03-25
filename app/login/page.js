import { Suspense } from "react";
import Login from "./Login"; 

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Login />
    </Suspense>
  );
}
