// passwordUtil.js — Simple password hashing utility (client-side demo)
// In production, use server-side bcrypt with proper salt rounds

// Simple hash function for demo purposes
export function hashPassword(password) {
  // For demo, we create a simple hash using base64 encoding
  // In production, use server-side bcryptjs with proper salt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Create a simple hash by converting to hex
  let hash = '';
  for (let i = 0; i < data.length; i++) {
    hash += data[i].toString(16).padStart(2, '0');
  }
  return hash;
}

// Verify password against hash
export function verifyPassword(password, hash) {
  // For demo purposes, just compare with the stored password
  // In production, use server-side bcryptjs compare
  return hashPassword(password) === hash;
}
