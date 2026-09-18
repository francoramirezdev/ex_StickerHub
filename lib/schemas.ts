import { z } from 'zod'

export const AlbumCreateSchema = z.object({
  title:         z.string().min(1, 'El nombre del álbum es obligatorio'),
  description:   z.string().optional(),
  coverImage:    z.string().optional(),
  releaseDate:   z.string().optional(),
  category:      z.string().optional(),
  totalStickers: z.coerce.number().int().positive().optional(),
})

export const AlbumUpdateSchema = AlbumCreateSchema.partial().extend({
  title: z.string().min(1, 'El nombre del álbum es obligatorio').optional(),
})

export const StickerUpsertSchema = z.object({
  albumId:       z.coerce.number().int().positive('albumId debe ser un número válido'),
  number:        z.string().min(1, 'El número de lámina es obligatorio'),
  isOwned:       z.enum(['true', 'false']).transform(v => v === 'true'),
  isDuplicate:   z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  duplicateCount:z.coerce.number().int().min(0).default(0),
  stickerType:   z.enum(['Normal', 'Dorada', 'Holográfica']).default('Normal'),
  name:          z.string().optional(),
})

export const StickerUpdateSchema = StickerUpsertSchema.omit({ albumId: true }).extend({
  number:  z.string().min(1, 'El número de lámina es obligatorio'),
  isOwned: z.enum(['true', 'false']).transform(v => v === 'true'),
})

export const BulkStickerSchema = z.object({
  albumId:  z.coerce.number().int().positive('albumId debe ser un número válido'),
  numbers:  z.array(z.string().min(1)).min(1, 'Debes ingresar al menos una lámina'),
  isOwned:  z.boolean(),
})
