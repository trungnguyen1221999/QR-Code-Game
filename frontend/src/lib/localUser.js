// src/lib/localUser.js

export function saveUserToLocal(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export function getUserFromLocal() {
  const data = localStorage.getItem('user');
  return data ? JSON.parse(data) : null;
}

export function removeUserFromLocal() {
  localStorage.removeItem('user');
}
