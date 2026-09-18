# StickerHub — Documentación de API

## Base URL
```
http://localhost:3000/api
```

## Notas Generales
- Endpoints que manejan archivos usan **`multipart/form-data`**, indicado con `📎`.
- El resto usan **`application/json`**.
- No hay autenticación implementada (entorno de desarrollo).

---

## ÁLBUMES

### `GET /api/albums`
Devuelve todos los álbumes con sus láminas incluidas.

**Response `200`**
```json
[
  {
    "id": 1,
    "title": "Mundial 2024",
    "description": "Álbum oficial del Mundial",
    "coverImage": "/uploads/albums/album-1234567890.jpg",
    "releaseDate": "2024-06-01T00:00:00.000Z",
    "category": "Deportivo",
    "totalStickers": 680,
    "createdAt": "2024-09-01T00:00:00.000Z",
    "updatedAt": "2024-09-01T00:00:00.000Z",
    "stickers": [ ... ]
  }
]
```

---

### `POST /api/albums` 📎
Crea un nuevo álbum. Acepta `multipart/form-data`.

**Request Body (form-data)**
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `title` | string | ✅ | Nombre del álbum |
| `coverImage` | file | ❌ | Imagen de portada |
| `releaseDate` | string (ISO) | ❌ | Fecha de lanzamiento |
| `description` | string | ❌ | Descripción |
| `category` | string | ❌ | Categoría (Deportivo, Anime, etc.) |
| `totalStickers` | number | ❌ | Total de láminas del álbum |

**Response `201`**
```json
{
  "id": 2,
  "title": "Pokémon XY",
  "description": null,
  "coverImage": null,
  "releaseDate": null,
  "category": "Anime",
  "totalStickers": null,
  "createdAt": "2024-09-18T00:00:00.000Z",
  "updatedAt": "2024-09-18T00:00:00.000Z"
}
```

---

### `GET /api/albums/:id`
Devuelve un álbum específico con todas sus láminas.

**Params**
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | ID del álbum |

**Response `200`**
```json
{
  "id": 1,
  "title": "Mundial 2024",
  "stickers": [
    {
      "id": 10,
      "number": "42",
      "name": "Lionel Messi",
      "image": "/uploads/stickers/sticker-1-42-1726606800000.jpg",
      "stickerType": "Dorada",
      "albumId": 1,
      "isOwned": true,
      "isDuplicate": false,
      "duplicateCount": 0
    }
  ]
}
```

**Response `404`**
```json
{ "error": "Not found" }
```

---

### `PUT /api/albums/:id`
Actualiza los datos de un álbum existente.

**Request Body (JSON)**
```json
{
  "title": "Mundial 2026",
  "description": "Álbum actualizado",
  "coverImage": "/uploads/albums/nueva-portada.jpg",
  "releaseDate": "2026-06-01",
  "category": "Deportivo",
  "totalStickers": 720
}
```

**Response `200`** — Devuelve el álbum actualizado.

---

### `DELETE /api/albums/:id`
Elimina un álbum y todas sus láminas (cascade).

**Response `200`**
```json
{ "success": true }
```

---

## LÁMINAS

### `POST /api/stickers` 📎
Crea o actualiza (upsert) una lámina por `albumId` + `number`. Acepta `multipart/form-data`.

**Request Body (form-data)**
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `albumId` | number | ✅ | ID del álbum |
| `number` | string | ✅ | Número o código de la lámina |
| `isOwned` | boolean string | ✅ | `"true"` o `"false"` |
| `duplicateCount` | number | ❌ | Cantidad de repetidas (default: 0) |
| `stickerType` | string | ❌ | `Normal`, `Dorada` o `Holográfica` |
| `name` | string | ❌ | Nombre descriptivo |
| `image` | file | ❌ | Foto de la lámina |

**Response `200`** — Devuelve la lámina creada o actualizada.
```json
{
  "id": 5,
  "number": "42",
  "name": "Lionel Messi",
  "image": null,
  "stickerType": "Normal",
  "albumId": 1,
  "isOwned": true,
  "isDuplicate": false,
  "duplicateCount": 0
}
```

---

### `GET /api/stickers/:id`
Devuelve una lámina específica por su ID.

**Response `200`** — Objeto lámina.  
**Response `404`**
```json
{ "error": "Not found" }
```

---

### `PUT /api/stickers/:id` 📎
Actualiza una lámina existente por su ID. Acepta `multipart/form-data`.

**Request Body (form-data)**
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `number` | string | ✅ | Nuevo número o código |
| `isOwned` | boolean string | ✅ | `"true"` o `"false"` |
| `duplicateCount` | number | ❌ | Cantidad de repetidas |
| `stickerType` | string | ❌ | `Normal`, `Dorada` o `Holográfica` |
| `name` | string | ❌ | Nombre descriptivo |
| `image` | file | ❌ | Nueva foto |

**Response `200`** — Devuelve la lámina actualizada.

---

### `DELETE /api/stickers/:id`
Elimina una lámina permanentemente.

**Response `200`**
```json
{ "success": true }
```

---

### `POST /api/stickers/:id/image` 📎
Sube o reemplaza la foto de una lámina existente.

**Request Body (form-data)**
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `image` | file | ✅ | Imagen de la lámina |

**Response `200`** — Devuelve la lámina con `image` actualizado.

**Response `400`**
```json
{ "error": "No image provided" }
```

---

### `POST /api/stickers/bulk`
Crea o actualiza múltiples láminas a la vez desde un listado de números.

**Request Body (JSON)**
```json
{
  "albumId": 1,
  "numbers": ["1", "2", "3", "15", "42", "CR7"],
  "isOwned": true
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `albumId` | number | ✅ | ID del álbum |
| `numbers` | string[] | ✅ | Arreglo de números de lámina |
| `isOwned` | boolean | ✅ | `true` = Tengo / `false` = Faltante |

**Response `200`**
```json
{
  "count": 6,
  "stickers": [ ... ]
}
```

**Response `400`**
```json
{ "error": "albumId y numbers requeridos" }
```

---

## Resumen de Endpoints

| Método | Endpoint | Descripción | Body |
|---|---|---|---|
| `GET` | `/api/albums` | Listar álbumes | — |
| `POST` | `/api/albums` | Crear álbum | form-data |
| `GET` | `/api/albums/:id` | Obtener álbum | — |
| `PUT` | `/api/albums/:id` | Actualizar álbum | JSON |
| `DELETE` | `/api/albums/:id` | Eliminar álbum | — |
| `POST` | `/api/stickers` | Crear/actualizar lámina | form-data |
| `GET` | `/api/stickers/:id` | Obtener lámina | — |
| `PUT` | `/api/stickers/:id` | Editar lámina | form-data |
| `DELETE` | `/api/stickers/:id` | Eliminar lámina | — |
| `POST` | `/api/stickers/:id/image` | Subir foto de lámina | form-data |
| `POST` | `/api/stickers/bulk` | Carga masiva | JSON |
