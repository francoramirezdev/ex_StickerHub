import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params
  const album = await prisma.album.findUnique({
    where: { id: Number(id) },
    include: { stickers: true },
  })
  if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(album)
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params
  const { title, description, coverImage, releaseDate, category, totalStickers } = await req.json()
  const album = await prisma.album.update({
    where: { id: Number(id) },
    data: {
      title,
      description,
      coverImage,
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      category,
      totalStickers: totalStickers ? Number(totalStickers) : undefined,
    },
  })
  return NextResponse.json(album)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params
  await prisma.album.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
