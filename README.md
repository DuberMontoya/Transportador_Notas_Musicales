# Transportador de Notas Musicales

Aplicación web para **transportar notas escritas** entre claves de instrumentos transpositores (Sib, Fa, Mib, Do, etc.), manteniendo el mismo **sonido real** (concert pitch).

Ejemplo: **Do escrito en clave de Sib** suena como **Si♭ real**; para obtener ese mismo sonido en **clave de Fa** debes escribir **Fa**.

## Stack

- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS v4** (diseño temático musical)
- **[Tonal.js](https://github.com/tonaljs/tonal)** — teoría musical, transposición e intervalos

## Arquitectura

```
src/
├── domain/              # Lógica de negocio pura
│   ├── constants/       # Definición de claves (Sib, Fa, Mib…)
│   ├── entities/
│   ├── interfaces/
│   └── services/        # NoteTranspositionService
├── application/         # Casos de uso y hooks
│   ├── hooks/
│   └── use-cases/
├── presentation/        # UI React
│   ├── components/
│   └── pages/
└── shared/              # Utilidades compartidas
```

Patrones: **capas (DDD ligero)**, **inyección por interfaz** (`INoteTranspositionService`), **caso de uso** (`transposeNotes`), separación dominio / presentación.

## Claves soportadas

| Clave | Ejemplo |
|-------|---------|
| Do (concert) | Sin transposición |
| Sib | Trompeta, clarinete, saxo soprano |
| Mib (alto) | Saxo alto |
| Mib (barítono) | Saxo barítono |
| Fa | Corno, corno inglés |
| La | Clarinete en La |
| Sol | Flauta alto |
| Re | Trompeta en Re |

## Uso

```bash
npm install
npm run dev
```

Formato de notas: `do`, `reb`, `do#`, `mib` (separadas por espacio, coma o línea). Octava y pistones se eligen con los selectores.

### Exportar PDF

Tras transportar, usa **Descargar PDF (pentagrama)**: partitura con clave, notas en solfeo y digitación debajo de cada nota.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — producción
- `npm run preview` — vista previa del build

## Publicar en GitHub Pages

Sitio: [https://dubermontoya.github.io/Transportador_Notas_Musicales/](https://dubermontoya.github.io/Transportador_Notas_Musicales/)

1. En el repo → **Settings** → **Pages** → **Build and deployment** → origen: **GitHub Actions** (no subas la carpeta raíz del código sin compilar).
2. Haz push a `main`: el workflow `.github/workflows/deploy-pages.yml` ejecuta `npm run build` y publica la carpeta `dist`.
3. El `base` de Vite en producción es `/Transportador_Notas_Musicales/` para que carguen JS y CSS.

Si ves pantalla en blanco, suele ser por rutas `/assets/...` sin el prefijo del repositorio o por publicar el código fuente en lugar del build.

## Librería de conversión

No existe una librería que convierta “clave Sib → clave Fa” directamente; la convención es por **offset en semitonos** entre partitura y sonido real. **Tonal.js** aplica la transposición intervalar (`Note.transpose`, `Interval.fromSemitones`) una vez calculado el desfase entre claves.
