import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { BulkStickerSchema } from '@/lib/schemas'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { albumId, numbers, isOwned } = BulkStickerSchema.parse(body)

    await prisma.sticker.createMany({
      data: numbers.map((n: string) => ({
        albumId, number: n, isOwned, isDuplicate: false, duplicateCount: 0,
      })),
      skipDuplicates: true,
    })

    await prisma.sticker.updateMany({
      where: { albumId, number: { in: numbers } },
      data: { isOwned },
    })

    const updated = await prisma.sticker.findMany({
      where: { albumId, number: { in: numbers } },
    })

    return NextResponse.json({ count: updated.length, stickers: updated })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ errors: e.flatten().fieldErrors }, { status: 400 })
    throw e
  }
}
