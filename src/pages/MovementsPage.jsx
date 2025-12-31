import React from "react";
import Card from "../components/Card.jsx";
import MovementForm from "../components/MovementForm.jsx";
import MovementTable from "../components/MovementTable.jsx";
import { useStockContext } from "../state/StockContext.jsx";
import { useMovements } from "../hooks/useMovements.js";
import { useStock } from "../hooks/useStock.js";
import { MovementType } from "../domain/types.js";
import { can, PermissionAction } from "../domain/permissions.js";

export default function MovementsPage({ defaultType }) {
  const { state, role } = useStockContext();
  const { addMovement, errorList, movements } = useMovements();
  const { stockById } = useStock();
  const canViewAll = can(role, PermissionAction.MOVEMENTS_VIEW_ALL);
  const allowedTypes = React.useMemo(() => {
    const types = [];
    if (can(role, PermissionAction.MOVEMENT_CREATE_OUT)) types.push(MovementType.OUT);
    if (can(role, PermissionAction.MOVEMENT_CREATE_IN)) types.push(MovementType.IN);
    if (can(role, PermissionAction.MOVEMENT_CREATE_ADJUST)) types.push(MovementType.ADJUST);
    return types.length ? types : [MovementType.OUT];
  }, [role]);
  const visibleMovements = canViewAll
    ? movements
    : movements.filter((movement) => movement.type === MovementType.OUT);

  return (
    <div className="grid2">
      <Card title="Registrar movimiento">
        <MovementForm
          products={state.products}
          stockById={stockById}
          onSubmit={addMovement}
          errors={errorList}
          defaultType={defaultType}
          allowedTypes={allowedTypes}
        />
      </Card>

      <Card title="Historial (últimos 50)">
        <MovementTable products={state.products} movements={visibleMovements} />
      </Card>
    </div>
  );
}
