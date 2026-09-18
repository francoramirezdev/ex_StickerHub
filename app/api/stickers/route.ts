import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { writeFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { StickerUpsertSchema } from '@/lib/schemas'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const parsed = StickerUpsertSchema.parse({
      albumId:        formData.get('albumId'),
      number:         formData.get('number'),
      isOwned:        formData.get('isOwned'),
      duplicateCount: formData.get('duplicateCount') || 0,
      stickerType:    formData.get('stickerType') || 'Normal',
      name:           formData.get('name') || undefined,
    })

    const isDuplicate = parsed.duplicateCount > 0

    let image: string | undefined
    const file = formData.get('image') as File | null
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `sticker-${parsed.albumId}-${parsed.number}-${Date.now()}.${ext}`
      await writeFile(path.join(process.cwd(), 'public', 'uploads', 'stickers', filename), Buffer.from(bytes))
      image = `/uploads/stickers/${filename}`
    }

    const sticker = await prisma.sticker.upsert({
      where: { albumId_number: { albumId: parsed.albumId, number: parsed.number } },
      update: {
        isOwned: parsed.isOwned,
        isDuplicate: parsed.isOwned ? isDuplicate : false,
        duplicateCount: parsed.isOwned ? parsed.duplicateCount : 0,
        name: parsed.name,
        stickerType: parsed.stickerType,
        ...(image ? { image } : {}),
      },
      create: {
        albumId:        parsed.albumId,
        number:         parsed.number,
        name:           parsed.name,
        stickerType:    parsed.stickerType,
        isOwned:        parsed.isOwned,
        isDuplicate:    parsed.isOwned ? isDuplicate : false,
        duplicateCount: parsed.isOwned ? parsed.duplicateCount : 0,
        image,
      },
    })
    return NextResponse.json(sticker)
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ errors: e.flatten().fieldErrors }, { status: 400 })
    throw e
  }
}
