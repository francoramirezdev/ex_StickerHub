import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params

  const formData = await req.formData()
  const file = formData.get('image')

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  const bytes  = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext      = file.name.split('.').pop() ?? 'jpg'
  const filename = `sticker-${id}-${Date.now()}.${ext}`
  const filepath = path.join(process.cwd(), 'public', 'uploads', 'stickers', filename)

  await writeFile(filepath, buffer)

  const sticker = await prisma.sticker.update({
    where: { id: Number(id) },
    data:  { image: `/uploads/stickers/${filename}` },
  })

  return NextResponse.json(sticker)
}
