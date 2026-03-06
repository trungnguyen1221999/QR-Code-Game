export function saveHostToLocal(host) {
  if (!host) return;
  localStorage.setItem('host', JSON.stringify(host));
}

export function getHostFromLocal() {
  const host = localStorage.getItem('host');
  return host ? JSON.parse(host) : null;
}

export function removeHostFromLocal() {
  localStorage.removeItem('host');
}
