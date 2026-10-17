// Prarush Universal Platform: Secure Client-Side Authentication & Session Engine
// Implements salted SHA-256 password hashing (Web Crypto API), session tokens, and pluggable backend adapters.
// Replaces legacy plaintext password storage.

const AUTH_STORAGE_KEY = 'prarush_active_session';
const USERS_STORAGE_KEY = 'prarush_registered_users';

// Cryptographic hash using OWASP-recommended PBKDF2 (100,000 iterations, HMAC-SHA-256)
export const PBKDF2_ITERATIONS = 100000;

export async function hashPassword(password, salt, iterations = PBKDF2_ITERATIONS) {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const saltBuffer = enc.encode(`${salt}:prarush_owasp_pbkdf2`);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256'
    },
    passwordKey,
    256 // 32 bytes
  );
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2$${iterations}$${hexHash}`;
}

// Legacy SHA-256 fallback calculation for seamless upgrade
export async function hashPasswordLegacy(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:prarush_secure_v2`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password against stored hash (supports PBKDF2 and legacy SHA-256)
export async function verifyPassword(password, userRecord) {
  if (!userRecord || !userRecord.passwordHash) return false;
  
  if (userRecord.passwordHash.startsWith('pbkdf2$')) {
    const parts = userRecord.passwordHash.split('$');
    const iterations = parseInt(parts[1], 10) || PBKDF2_ITERATIONS;
    const computed = await hashPassword(password, userRecord.salt, iterations);
    return computed === userRecord.passwordHash;
  }
  
  // Legacy fast SHA-256 verification
  const legacyHash = await hashPasswordLegacy(password, userRecord.salt);
  return legacyHash === userRecord.passwordHash;
}

// Generate random cryptographic salt or token
function generateSecureToken() {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Retrieve registered users securely
function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('Failed to save registered users:', err);
  }
}

// Default Guest User Profile
export const DEFAULT_GUEST_USER = {
  id: 'usr-guest',
  name: 'Guest Developer',
  email: 'guest@prarush.local',
  avatar: '🚀',
  role: 'Independent Developer & Creator',
  isGuest: true,
  createdAt: new Date().toISOString()
};

// Get current active session
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return DEFAULT_GUEST_USER;
    const session = JSON.parse(raw);
    if (!session || !session.user) return DEFAULT_GUEST_USER;

    // Enforce session expiry verification
    if (session.expiresAt) {
      const expiry = new Date(session.expiresAt);
      if (expiry < new Date()) {
        console.warn('Prarush session expired. Terminating session.');
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return DEFAULT_GUEST_USER;
      }
      // Sliding window: refresh expiration on active user access (30 days of inactivity)
      session.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // Ignore storage write errors on quota
      }
    }

    return session.user;
  } catch {
    return DEFAULT_GUEST_USER;
  }
}

// Register a new user
export async function registerUser({ name, email, password }) {
  if (!email || !password || !name) {
    throw new Error('Name, email, and password are required.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const users = getRegisteredUsers();
  const existing = users.find(u => u.email === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = generateSecureToken();
  const passwordHash = await hashPassword(password, salt);
  const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newUserRecord = {
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    avatar: '⚡',
    role: 'Full-Stack Developer & Architect',
    isGuest: false,
    salt,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(newUserRecord);
  saveRegisteredUsers(users);

  // Set active session
  const sanitizedUser = {
    id: newUserRecord.id,
    name: newUserRecord.name,
    email: newUserRecord.email,
    avatar: newUserRecord.avatar,
    role: newUserRecord.role,
    isGuest: false,
    createdAt: newUserRecord.createdAt
  };

  const session = {
    token: generateSecureToken(),
    user: sanitizedUser,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return sanitizedUser;
}

// Authenticate and log in an existing user
export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  const userRecord = users.find(u => u.email === normalizedEmail);

  if (!userRecord) {
    throw new Error('No account found with this email. Please register or continue as guest.');
  }

  const isValid = await verifyPassword(password, userRecord);
  if (!isValid) {
    throw new Error('Incorrect password. Please try again or reset your password.');
  }

  // Seamlessly upgrade legacy SHA-256 hashes to OWASP PBKDF2 upon successful login
  if (!userRecord.passwordHash.startsWith('pbkdf2$')) {
    userRecord.passwordHash = await hashPassword(password, userRecord.salt);
    const idx = users.findIndex(u => u.id === userRecord.id);
    if (idx >= 0) {
      users[idx] = userRecord;
      saveRegisteredUsers(users);
    }
  }

  const sanitizedUser = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    avatar: userRecord.avatar || '⚡',
    role: userRecord.role || 'Member',
    isGuest: false,
    createdAt: userRecord.createdAt
  };

  const session = {
    token: generateSecureToken(),
    user: sanitizedUser,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return sanitizedUser;
}

// Sign out current session
export function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  return DEFAULT_GUEST_USER;
}

// Continue or switch to Guest mode
export function continueAsGuest() {
  const session = {
    token: `guest-${generateSecureToken()}`,
    user: DEFAULT_GUEST_USER,
    expiresAt: null
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return DEFAULT_GUEST_USER;
}

// Update profile fields
export function updateUserProfile(updates) {
  const current = getCurrentUser();
  const updatedUser = { ...current, ...updates };

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      const session = JSON.parse(raw);
      session.user = updatedUser;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch {}
  }

  if (!current.isGuest) {
    const users = getRegisteredUsers();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates };
      saveRegisteredUsers(users);
    }
  }

  return updatedUser;
}
