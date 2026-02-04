// Simple script to clear Supabase auth state and fix lock issues
// Run in browser console: copy and paste this code

console.log('🧹 Clearing Supabase auth state...');

// Clear all Supabase-related items from localStorage
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('neema')) {
    console.log(`Removing: ${key}`);
    localStorage.removeItem(key);
  }
});

// Clear sessionStorage too
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('neema')) {
    console.log(`Removing from session: ${key}`);
    sessionStorage.removeItem(key);
  }
});

console.log('✅ Auth state cleared. Please refresh the page.');
console.log('💡 Close any other tabs with this site open, then refresh.');
