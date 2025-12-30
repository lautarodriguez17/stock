import React, { useMemo, useState } from "react";
import { StockProvider } from "./state/StockContext.jsx";
import Layout from "./components/Layout.jsx";
import Tabs from "./components/Tabs.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import MovementsPage from "./pages/MovementsPage.jsx";

export default function App() {
  const [tab, setTab] = useState("dashboard");

  const tabs = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard" },
      { key: "products", label: "Productos" },
      { key: "movements", label: "Movimientos" }
    ],
    []
  );

  return (
    <StockProvider>
      <Layout>
        <Tabs tabs={tabs} value={tab} onChange={setTab} />

        {tab === "dashboard" && <Dashboard />}
        {tab === "products" && <ProductsPage />}
        {tab === "movements" && <MovementsPage />}
      </Layout>
    </StockProvider>
  );
}
