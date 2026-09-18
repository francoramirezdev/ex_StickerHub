import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const albums = await prisma.album.findMany({
    include: { stickers: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(albums)
}

export async function POST(req: Request) {
  const formData = await req.formData()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const releaseDate = formData.get('releaseDate') as string | null
  const category = formData.get('category') as string | null
  const totalStickers = formData.get('totalStickers') as string | null
  
  let coverImage: string | undefined = undefined

  const file = formData.get('coverImage') as File | null
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `album-${Date.now()}.${ext}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'albums', filename)
    await writeFile(filepath, buffer)
    coverImage = `/uploads/albums/${filename}`
  }

  const album = await prisma.album.create({
    data: {
      title,
      description,
      coverImage,
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      category,
      totalStickers: totalStickers ? Number(totalStickers) : undefined,
    },
  })
  return NextResponse.json(album, { status: 201 })
}
