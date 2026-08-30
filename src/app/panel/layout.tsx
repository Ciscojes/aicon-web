import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { logout } from "@/app/iniciar-sesion/actions";
import { authorizeInternalAccess } from "@/modules/users/application/authorize-internal-access";
import { getCurrentProfile } from "@/modules/users/infrastructure/get-current-profile";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const access = authorizeInternalAccess(await getCurrentProfile());

  if (!access.allowed) {
    redirect("/iniciar-sesion");
  }

  return (
    <div className="panel-shell">
      <header className="panel-header">
        <div>
          <span className="wordmark">AICON</span>
          <p className="panel-user">
            {access.profile.name} · {access.profile.role}
          </p>
        </div>
        <form action={logout}>
          <button className="button button-secondary" type="submit">
            Cerrar sesión
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
