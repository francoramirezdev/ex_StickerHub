import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Si estamos en producción, bloqueamos el acceso a la documentación de la API
  if (process.env.NODE_ENV === 'production') {
    const path = request.nextUrl.pathname
    if (path === '/api-docs' || path === '/swagger.html' || path === '/openapi.yaml') {
      return new NextResponse('404 Not Found', { status: 404 })
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api-docs', '/swagger.html', '/openapi.yaml'],
}
