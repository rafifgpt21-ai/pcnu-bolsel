import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const isAdmin = role === 'EDITOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';
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
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : token.sub || ""
        if (typeof token.role === "string") session.user.role = token.role
      }
      return session
    },
  },
  providers: [], // Empty for now, overridden in auth.ts
} satisfies NextAuthConfig;
