import { Suspense } from "react";
import Register from "./register"; 

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Register />
    </Suspense>
  );
}
