# Trading API - Cocos Challenge

## Tecnologías utilizadas

- **[Fastify](https://fastify.dev/)** 
- **[Prisma](https://prisma.io/)** 
- **[Bun](https://bun.sh/)** 
- **[TypeScript](https://typescriptlang.org/)** 
- **PostgreSQL** 

## Cómo correr el proyecto

### Requisitos

- [Bun](https://bun.sh/) instalado
- PostgreSQL corriendo
- Archivo `.env` configurado con las variables de entorno necesarias

### Instalación

1. Clona el repositorio e instala las dependencias:
```bash
bun install
```

2. Configura tu base de datos PostgreSQL y crea un archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/trading_db"
PORT=3000
HOST=0.0.0.0
```

3. Ejecuta las migraciones de la base de datos:
```bash
bun db:migrate
```

4. Genera el cliente de Prisma:
```bash
bun db:generate
```

### Desarrollo

```bash
bun dev
```

El servidor estará disponible en `http://localhost:3000` por defecto.

## Testing

```bash
bun test
```

## Documentación

```
http://localhost:3000/docs
```

## Base de datos

El proyecto utiliza PostgreSQL con Prisma como ORM

Se agregó a los modelos dados:
1. index para mejor performance en el search
2. reason en el modelo order para persitir el motivo de una orden que fue rechazada


