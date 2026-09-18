import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'

// POST /api/stickers — upsert (con soporte para imagen form-data)
export async function POST(req: Request) {
  const formData = await req.formData()
  
  const albumId = Number(formData.get('albumId'))
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
    const filename = `sticker-${albumId}-${number}-${Date.now()}.${ext}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'stickers', filename)
    await writeFile(filepath, buffer)
    image = `/uploads/stickers/${filename}`
  }

  const sticker = await prisma.sticker.upsert({
    where: { albumId_number: { albumId, number } },
    update: { 
      isOwned, 
      isDuplicate: isOwned ? isDuplicate : false, 
      duplicateCount: isOwned ? duplicateCount : 0,
      name: name || undefined, 
      stickerType: stickerType || undefined,
      ...(image ? { image } : {})
    },
    create: { 
      albumId, 
      number, 
      name, 
      stickerType: stickerType || 'Normal', 
      isOwned, 
      isDuplicate: isOwned ? isDuplicate : false,
      duplicateCount: isOwned ? duplicateCount : 0,
      image
    },
  })
  return NextResponse.json(sticker)
}
