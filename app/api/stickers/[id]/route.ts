import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { writeFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { StickerUpdateSchema } from '@/lib/schemas'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params
  const sticker = await prisma.sticker.findUnique({ where: { id: Number(id) } })
  if (!sticker) return NextResponse.json({ error: 'Lámina no encontrada' }, { status: 404 })
  return NextResponse.json(sticker)
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params
    const formData = await req.formData()

    const parsed = StickerUpdateSchema.parse({
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
      const filename = `sticker-${id}-${Date.now()}.${ext}`
      await writeFile(path.join(process.cwd(), 'public', 'uploads', 'stickers', filename), Buffer.from(bytes))
      image = `/uploads/stickers/${filename}`
    }

    const sticker = await prisma.sticker.update({
      where: { id: Number(id) },
      data: {
        number:         parsed.number,
        name:           parsed.name ?? null,
        stickerType:    parsed.stickerType,
        isOwned:        parsed.isOwned,
        isDuplicate:    parsed.isOwned ? isDuplicate : false,
        duplicateCount: parsed.isOwned ? parsed.duplicateCount : 0,
        ...(image ? { image } : {}),
      },
    })
    return NextResponse.json(sticker)
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ errors: e.flatten().fieldErrors }, { status: 400 })
    throw e
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params
  await prisma.sticker.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
