# 🎴 StickerHub

StickerHub es una aplicación web full-stack diseñada para coleccionistas de láminas (stickers, cromos o figuritas). Permite a los usuarios crear álbumes digitales, hacer seguimiento de su colección, identificar láminas faltantes y llevar el conteo exacto de las láminas repetidas.

## 📸 Capturas de Pantalla

*(Reemplaza estas imágenes con tus propias capturas guardándolas en la carpeta `/docs/`)*

### Dashboard y Álbumes
![Dashboard](./docs/home.png)
*Vista principal con resumen global de la colección y listado de álbumes.*

### Colección de Láminas (Detalle del Álbum)
![Detalle de Álbum](./docs/album-detail.png)
*Cuadrícula interactiva de láminas con efectos visuales para láminas Doradas y Holográficas.*

### Registro / Edición de Lámina
![Modal de Edición](./docs/modal-sticker.png)
*Modal para subir fotos reales de la lámina, establecer cantidad de repetidas y tipo de lámina.*

### Carga Masiva y Listados
![Carga Masiva](./docs/bulk-import.png)
*Herramienta de carga masiva y exportación rápida de listados para intercambios.*

---

## ✨ Funcionalidades Principales

- **Gestión de Álbumes:** Crea múltiples álbumes con portada y metadata (fecha de lanzamiento, temática).
- **Control Detallado de Láminas:**
  - Registro de estado: *Tengo* (con conteo de duplicadas) o *Me Falta*.
  - Tipos especiales: Láminas Normales, Doradas (brillo estático dorado) y Holográficas (animación iridiscente).
  - Subida de fotografías locales por cada lámina.
- **Importación Masiva (Bulk):** Agrega decenas de láminas a la vez pegando listas separadas por comas o saltos de línea.
- **Listados de Intercambio:** Generación automática de listas de "Faltantes" y "Repetidas" listas para copiar al portapapeles.
- **Resumen Estadístico:** Panel de progreso en tiempo real con porcentajes de completado general y por álbum.

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 16 (App Router), React, Tailwind CSS (Custom Design System).
- **Backend:** Next.js Route Handlers (API REST).
- **Base de Datos:** MySQL 8.
- **ORM:** Prisma.
- **Infraestructura:** Docker & Docker Compose.

---

## 🚀 Instalación y Uso (Docker)

Todo el entorno (Base de Datos + Aplicación Web) está 100% contenerizado. No necesitas instalar Node.js ni MySQL en tu máquina, solo **Docker**.

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/stickerhub.git
cd stickerhub
```

### 2. Levantar la aplicación
Ejecuta el siguiente comando para construir la imagen e iniciar los contenedores:
```bash
docker compose up -d --build
```
*Este comando descargará MySQL, instalará las dependencias de Node, ejecutará las migraciones de base de datos automáticamente e iniciará el servidor en modo desarrollo (con hot-reload).*

### 3. Acceder a la Web
Abre tu navegador en:
👉 **http://localhost:3000**

---

## 📚 Documentación de API (OpenAPI / Swagger)

La API cuenta con documentación oficial de OpenAPI.

- Puedes acceder a la interfaz gráfica interactiva visitando: `http://localhost:3000/api-docs` (⚠️ *Solo disponible en modo desarrollo local*).
- El archivo crudo se encuentra en `docs/openapi.yaml` (ideal para importar directamente en **Postman** y realizar pruebas).