import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { writeFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { AlbumUpdateSchema } from '@/lib/schemas'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params
  const album = await prisma.album.findUnique({
    where: { id: Number(id) },
    include: { stickers: true },
  })
  if (!album) return NextResponse.json({ error: 'Álbum no encontrado' }, { status: 404 })
  return NextResponse.json(album)
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = AlbumUpdateSchema.parse(body)
    const album = await prisma.album.update({
      where: { id: Number(id) },
      data: {
        ...parsed,
        releaseDate: parsed.releaseDate ? new Date(parsed.releaseDate) : undefined,
      },
    })
    return NextResponse.json(album)
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ errors: e.flatten().fieldErrors }, { status: 400 })
    throw e
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params
  await prisma.album.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
