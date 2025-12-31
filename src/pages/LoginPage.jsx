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
      <div className="loginShell">
        <div className="loginLogoWrap">
          <img className="loginLogo" src="/logo.png" alt="Kiosco Stock" />
        </div>
        <form className="loginCard" onSubmit={submit}>
          <div className="loginHeader">
            <h2 className="loginTitle">Iniciar sesion</h2>
            <p className="loginSubtitle">Acceso al sistema de stock</p>
          </div>

          <div className="loginField">
            <label className="loginLabel" htmlFor="loginUser">Usuario</label>
            <div className="loginInputWrap">
              <span className="loginIcon" aria-hidden="true">👤</span>
              <input
                id="loginUser"
                className="input loginInput"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="loginField">
            <label className="loginLabel" htmlFor="loginPassword">Password</label>
            <div className="loginInputWrap">
              <span className="loginIcon" aria-hidden="true">🔒</span>
              <input
                id="loginPassword"
                className="input loginInput"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error ? <div className="errorBox">{error}</div> : null}

          <button className="btnPrimary loginButton" type="submit">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
