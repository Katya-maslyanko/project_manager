import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('accessToken')?.value;
    if (!token) return NextResponse.next();

    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const role = payload.role;

    const url = req.nextUrl.clone();

    // Если куратор проекта пытается зайти на страницу команды
    if (url.pathname.startsWith('/team') && role === 'project_manager') {
        url.pathname = '/project-manager/team'; // Перенаправление на страницу менеджера проектов
        return NextResponse.redirect(url);
    }

    // Если участник команды пытается зайти на страницу менеджера проектов
    if (url.pathname.startsWith('/project-manager') && role !== 'project_manager') {
        url.pathname = '/team'; // Перенаправление на страницу участника команды
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}