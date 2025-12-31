import { Roles } from "./permissions.js";

const USERS = [
  { username: "Aru", password: "281093", role: Roles.ADMIN },
  { username: "kiosco", password: "123456", role: Roles.EMPLOYEE }
];

export function authenticate(username, password) {
  const inputUser = (username || "").trim();
  const user = USERS.find(
    (item) => item.username === inputUser && item.password === password
  );
  if (!user) return null;
  return { username: user.username, role: user.role };
}
