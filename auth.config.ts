import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
      const isSuperAdmin = role === 'SUPER_ADMIN';
      
      const isProtectedPath = nextUrl.pathname.startsWith('/admin') && nextUrl.pathname !== '/admin/login';
      const isUserManagementPath = nextUrl.pathname.startsWith('/admin/users');

      if (isUserManagementPath) {
        if (isLoggedIn && isSuperAdmin) return true;
        return Response.redirect(new URL('/admin', nextUrl));
      }

      if (isProtectedPath) {
        if (isLoggedIn && isAdmin) return true;
        return false; // Redirect to sign in
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user && token.role) {
        (session.user as any).role = token.role as string
      }
      return session
    },
  },
  providers: [], // Empty for now, overridden in auth.ts
} satisfies NextAuthConfig;
