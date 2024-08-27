import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { connect } from './lib/db';

const isProtectedRoute = createRouteMatcher([
  '/pages/search(.*)',
  '/pages/rate(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth().protect();
    try {
      await connect();
      console.log(
        'Conexión a la base de datos verificada después del inicio de sesión'
      );
    } catch (error) {
      console.error(
        'Error al verificar la conexión a la base de datos:',
        error
      );
    }
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
