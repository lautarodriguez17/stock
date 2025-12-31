export const Roles = {
  ADMIN: "Admin",
  EMPLOYEE: "Empleado"
};

export const PermissionAction = {
  PRODUCT_CREATE: "PRODUCT_CREATE",
  MOVEMENT_CREATE_IN: "MOVEMENT_CREATE_IN",
  MOVEMENT_CREATE_OUT: "MOVEMENT_CREATE_OUT",
  MOVEMENT_CREATE_ADJUST: "MOVEMENT_CREATE_ADJUST",
  MOVEMENTS_VIEW_ALL: "MOVEMENTS_VIEW_ALL"
};

export const permissionsByRole = {
  [Roles.ADMIN]: [
    PermissionAction.PRODUCT_CREATE,
    PermissionAction.MOVEMENT_CREATE_IN,
    PermissionAction.MOVEMENT_CREATE_OUT,
    PermissionAction.MOVEMENT_CREATE_ADJUST,
    PermissionAction.MOVEMENTS_VIEW_ALL
  ],
  [Roles.EMPLOYEE]: [PermissionAction.MOVEMENT_CREATE_OUT]
};

export const roleOptions = [Roles.ADMIN, Roles.EMPLOYEE];

export function can(role, action) {
  return permissionsByRole[role]?.includes(action);
}
