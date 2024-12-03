import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone(); // Clona a URL para manipulação

  // Verifica se a rota atual não é /client
  if (url.pathname !== '/client') {
    url.pathname = '/client'; // Altera o caminho para /client
    return NextResponse.redirect(url); // Redireciona para /client
  }

  // Se já estiver na rota correta, continua
  return NextResponse.next();
}

// Configuração para aplicar o middleware somente em certas rotas
export const config = {
  matcher: '/', // Aplica o middleware somente na rota /
};
