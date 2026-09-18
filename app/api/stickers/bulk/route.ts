import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { albumId, numbers, isOwned } = await req.json()

  if (!albumId || !Array.isArray(numbers) || numbers.length === 0)
    return NextResponse.json({ error: 'albumId y numbers requeridos' }, { status: 400 })

  // Crear los que no existen, saltar duplicados
  await prisma.sticker.createMany({
    data: numbers.map((n: string) => ({
      albumId: Number(albumId),
      number: n,
      isOwned,
      isDuplicate: false,
      duplicateCount: 0,
    })),
    skipDuplicates: true,
  })

  // Actualizar el estado de todos (incluyendo los ya existentes)
  await prisma.sticker.updateMany({
    where: { albumId: Number(albumId), number: { in: numbers } },
    data: { isOwned },
  })

  const updated = await prisma.sticker.findMany({
    where: { albumId: Number(albumId), number: { in: numbers } },
  })

  return NextResponse.json({ count: updated.length, stickers: updated })
}
