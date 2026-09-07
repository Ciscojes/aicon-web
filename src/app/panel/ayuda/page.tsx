import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Guía de operación | Panel Aicon" };

export default function OperationsHelpPage() {
  return (
    <main className="panel-content catalog-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Ayuda interna</p>
          <h1>Guía rápida de operación</h1>
          <p className="lede">
            Recorridos frecuentes para mantener el catálogo, los clientes y las visitas al día.
          </p>
        </div>
      </div>

      <section className="catalog-form-panel">
        <h2>Inicio de jornada</h2>
        <ol>
          <li>Revisa en el resumen los seguimientos atrasados y las visitas próximas.</li>
          <li>Abre Citas para resolver cambios pendientes y avisos fallidos.</li>
          <li>Abre el CRM para asignar consultas nuevas y programar su próxima acción.</li>
        </ol>
      </section>

      <section className="catalog-form-panel">
        <h2>Publicar inventario</h2>
        <ol>
          <li>Completa primero el condominio y publícalo.</li>
          <li>Crea o habilita el modelo cuando la unidad no sea de diseño único.</li>
          <li>Completa la unidad, revisa fotografías y confirma su publicación.</li>
          <li>Comprueba el resultado desde el catálogo público.</li>
        </ol>
      </section>

      <section className="catalog-form-panel">
        <h2>Gestionar una visita</h2>
        <ol>
          <li>Confirma cliente, propiedad, asesor y horario antes de modificarla.</li>
          <li>Reprograma o cancela únicamente desde la tarjeta de la cita.</li>
          <li>Después de la visita registra realizada, cancelada o no asistió.</li>
          <li>Consulta el historial cuando necesites verificar quién hizo un cambio.</li>
        </ol>
      </section>

      <section className="catalog-form-panel">
        <h2>Si algo falla</h2>
        <p>
          Conserva el mensaje mostrado, la hora y la tarea que realizabas. No repitas
          publicaciones, cotizaciones o reservas si el panel no confirmó el resultado.
          Comunica esos datos al responsable técnico sin incluir contraseñas ni enlaces
          temporales de clientes.
        </p>
        <Link className="button button-secondary" href="/panel">
          Volver al resumen
        </Link>
      </section>
    </main>
  );
}
