"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/iniciar-sesion/actions";

const initialState: LoginState = {};

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="auth-form">
      {nextPath ? <input name="nextPath" type="hidden" value={nextPath} /> : null}

      <div className="field">
        <label htmlFor="email">Correo electrónico</label>
        <input
          autoComplete="email"
          id="email"
          name="email"
          required
          type="email"
        />
        {state.errors?.email ? (
          <p className="field-error">{state.errors.email[0]}</p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input
          autoComplete="current-password"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
        {state.errors?.password ? (
          <p className="field-error">{state.errors.password[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p aria-live="polite" className="form-message" role="alert">
          {state.message}
        </p>
      ) : null}

      <button className="button button-primary" disabled={pending} type="submit">
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
