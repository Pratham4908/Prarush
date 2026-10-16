// Secure Compatibility Facade: delegates to authManager.js
// Plaintext password storage has been permanently removed.

import { 
  getCurrentUser as getManagerCurrentUser,
  registerUser,
  loginUser as managerLoginUser,
  logoutUser as managerLogoutUser,
  DEFAULT_GUEST_USER 
} from './authManager.js';

export function getCurrentUser() {
  const u = getManagerCurrentUser();
  return u.isGuest ? null : u;
}

export async function signUpUser({ name, email, password, avatar = '👤' }) {
  const user = await registerUser({ name, email, password });
  return user;
}

export async function loginUser(email, password) {
  const user = await managerLoginUser({ email, password });
  return user;
}

export function logoutUser() {
  managerLogoutUser();
}

export function deleteAccount(userId) {
  managerLogoutUser();
}
