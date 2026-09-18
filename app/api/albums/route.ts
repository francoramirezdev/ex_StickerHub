import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { writeFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { AlbumCreateSchema } from '@/lib/schemas'

export async function GET() {
  const albums = await prisma.album.findMany({
    include: { stickers: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(albums)
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const parsed = AlbumCreateSchema.parse({
      title:         formData.get('title'),
      description:   formData.get('description') || undefined,
      releaseDate:   formData.get('releaseDate') || undefined,
      category:      formData.get('category') || undefined,
      totalStickers: formData.get('totalStickers') || undefined,
    })

    let coverImage: string | undefined
    const file = formData.get('coverImage') as File | null
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `album-${Date.now()}.${ext}`
      await writeFile(path.join(process.cwd(), 'public', 'uploads', 'albums', filename), Buffer.from(bytes))
      coverImage = `/uploads/albums/${filename}`
    }

    const album = await prisma.album.create({
      data: {
        ...parsed,
        coverImage,
        releaseDate: parsed.releaseDate ? new Date(parsed.releaseDate) : undefined,
      },
    })
    return NextResponse.json(album, { status: 201 })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ errors: e.flatten().fieldErrors }, { status: 400 })
    throw e
  }
}
