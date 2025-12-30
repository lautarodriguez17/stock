import React from "react";

export default function Layout({ children }) {
  return (
    <div className="container">
      <header className="header">
        <div>
          <h1 className="title">Kiosco Stock</h1>
          <p className="subtitle">MVP sin backend · localStorage · Node 20</p>
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <span>Datos guardados en tu navegador (localStorage).</span>
      </footer>
    </div>
  );
}
