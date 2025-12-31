import React, { useMemo, useState } from "react";
import { StockProvider, useStockContext } from "./state/StockContext.jsx";
import Layout from "./components/Layout.jsx";
import Tabs from "./components/Tabs.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import MovementsPage from "./pages/MovementsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

export default function App() {
  return (
    <StockProvider>
      <AppContent />
    </StockProvider>
  );
}

function AppContent() {
  const { auth } = useStockContext();
  const [tab, setTab] = useState("dashboard");
  const [movementTypePreset, setMovementTypePreset] = useState(null);

  const tabs = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard" },
      { key: "products", label: "Productos" },
      { key: "movements", label: "Movimientos" }
    ],
    []
  );

  if (!auth) return <LoginPage />;

  return (
    <Layout>
      <Tabs
        tabs={tabs}
        value={tab}
        onChange={(nextTab) => {
          setTab(nextTab);
          setMovementTypePreset(null);
        }}
      />

      {tab === "dashboard" && (
        <Dashboard
          onGoToProducts={() => {
            setTab("products");
            setMovementTypePreset(null);
          }}
          onGoToMovements={(type) => {
            setMovementTypePreset(type ?? null);
            setTab("movements");
          }}
        />
      )}
      {tab === "products" && <ProductsPage />}
      {tab === "movements" && <MovementsPage defaultType={movementTypePreset} />}
    </Layout>
  );
}
