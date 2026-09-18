# Contexto para Agentes AI (StickerHub)

## Misión
Desarrollar una aplicación web para gestionar láminas de álbumes.

## Stack
- **Framework:** Next.js (App Router).
- **Lenguaje:** TypeScript.
- **Base de Datos:** MySQL (via Docker).
- **ORM:** Prisma.
- **Estilos:** Tailwind CSS.

## Reglas de Desarrollo
1. **Ponytail Mode:** Código mínimo viable. Usa utilidades nativas o de la librería estándar antes de añadir dependencias. 
2. **Componentes:** Server Components por defecto. Usa `"use client"` solo cuando haya interactividad.
3. **API:** Next.js Route Handlers (`app/api/...`).
4. **Base de Datos:** Actualiza `schema.prisma` y corre `npx prisma migrate dev` para cambios. No queries SQL manuales.

## Modelos Planificados
- `Album` (id, title, description, coverImage)
- `Sticker` (id, albumId, number, isOwned, isDuplicate) o modelo pivote de inventario.
