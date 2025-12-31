import React, { useState } from "react";
import Field from "../components/Field.jsx";
import { useStockContext } from "../state/StockContext.jsx";

export default function LoginPage() {
  const { login } = useStockContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const result = login(username, password);
    if (!result.ok) {
      setError(result.error || "Usuario o contrasena incorrectos.");
      return;
    }
    setError("");
  }

  return (
    <div className="loginPage">
      <form className="loginCard" onSubmit={submit}>
        <div className="loginHeader">
          <h2 className="loginTitle">Iniciar sesion</h2>
          <p className="loginSubtitle">Acceso al sistema de stock</p>
        </div>

        <Field label="Usuario">
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuario"
            autoComplete="username"
          />
        </Field>

        <Field label="Password">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
        </Field>

        {error ? <div className="errorBox">{error}</div> : null}

        <button className="btnPrimary loginButton" type="submit">
          Ingresar
        </button>
      </form>
    </div>
  );
}
