export function useAuth() {
  return {
    user: null,
    isLoading: false,
    signOut: async () => {},
  };
}