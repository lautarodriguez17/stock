import { ActionType } from "./actions.js";

const MAX_MOVEMENTS = 2000;

export const initialState = {
  products: [],
  movements: []
};

export function stockReducer(state, action) {
  switch (action.type) {
    case ActionType.INIT: {
      return {
        products: action.payload.products,
        movements: action.payload.movements
      };
    }

    case ActionType.UPSERT_PRODUCT: {
      const p = action.payload;
      const exists = state.products.some((x) => x.id === p.id);
      return {
        ...state,
        products: exists
          ? state.products.map((x) => (x.id === p.id ? { ...x, ...p } : x))
          : [...state.products, p]
      };
    }

    case ActionType.DEACTIVATE_PRODUCT: {
      const id = action.payload;
      return {
        ...state,
        products: state.products.map((p) => (p.id === id ? { ...p, active: false } : p))
      };
    }

    case ActionType.ADD_MOVEMENT: {
      const nextMovements = [action.payload, ...state.movements];
      return {
        ...state,
        movements: nextMovements.slice(0, MAX_MOVEMENTS)
      };
    }

    case ActionType.RESET_ALL: {
      return initialState;
    }

    default:
      return state;
  }
}
