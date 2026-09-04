import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

import { logout } from "@/app/iniciar-sesion/actions";
import { authorizeInternalAccess } from "@/modules/users/application/authorize-internal-access";
import { canAccessCrm, canManageCatalog, canManageUsers } from "@/modules/users/domain/role";
import { getCurrentProfile } from "@/modules/users/infrastructure/get-current-profile";

export default async function PanelLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
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
        <div className="panel-actions">
          {canAccessCrm(access.profile.role) ? <Link className="text-link" href="/panel/crm">CRM</Link> : null}
          {canAccessCrm(access.profile.role) ? <Link className="text-link" href="/panel/citas">Citas</Link> : null}
          {canManageUsers(access.profile.role) ? <Link className="text-link" href="/panel/configuracion/financiamiento">Configuración</Link> : null}
          {canManageCatalog(access.profile.role) ? (
            <nav aria-label="Administración del catálogo" className="panel-catalog-nav">
              <Link className="text-link" href="/panel/catalogo/condominios">
                Condominios
              </Link>
              <Link className="text-link" href="/panel/catalogo/modelos">
                Modelos
              </Link>
              <Link className="text-link" href="/panel/catalogo/unidades">
                Unidades
              </Link>
            </nav>
          ) : null}
          <form action={logout}>
            <button className="button button-secondary" type="submit">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
