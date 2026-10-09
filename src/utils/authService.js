// Authentication Service: LocalStorage User Registry, Sessions, and Account Management

const USERS_KEY = 'citylife_registered_users';
const CURRENT_USER_KEY = 'citylife_active_session';

export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function signUpUser({ name, email, password, avatar = '👤', emergencyContact = '' }) {
  const users = getRegisteredUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password, // stored locally
    avatar,
    emergencyContact: emergencyContact.trim(),
    scoutLevel: 'Level 1 Urban Scout',
    contributedReports: 0,
    savedPlacesCount: 0,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
}

export function loginUser(email, password) {
  const users = getRegisteredUsers();
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
  if (!user) {
    throw new Error('Invalid email or password. Please try again.');
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function deleteAccount(userId) {
  const users = getRegisteredUsers();
  const filtered = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
  localStorage.removeItem(CURRENT_USER_KEY);
  // Also clear saved preferences
  localStorage.removeItem('city_saved_spots');
}
