import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params
  const sticker = await prisma.sticker.findUnique({ where: { id: Number(id) } })
  if (!sticker) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(sticker)
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params
  const formData = await req.formData()
  
  const number = formData.get('number') as string
  const name = formData.get('name') as string | null
  const stickerType = formData.get('stickerType') as string | null
  const isOwned = formData.get('isOwned') === 'true'
  const duplicateCount = Number(formData.get('duplicateCount') || 0)
  const isDuplicate = duplicateCount > 0

  let image: string | undefined = undefined

  const file = formData.get('image') as File | null
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `sticker-${id}-${Date.now()}.${ext}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'stickers', filename)
    await writeFile(filepath, buffer)
    image = `/uploads/stickers/${filename}`
  }

  const sticker = await prisma.sticker.update({
    where: { id: Number(id) },
    data: {
      number,
      name: name || null,
      stickerType: stickerType || 'Normal',
      isOwned,
      isDuplicate: isOwned ? isDuplicate : false,
      duplicateCount: isOwned ? duplicateCount : 0,
      ...(image ? { image } : {})
    },
  })
  return NextResponse.json(sticker)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params
  await prisma.sticker.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
