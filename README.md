# System MX — Frontend Web Application

**System MX** es la plataforma web de gestión comercial, control de inventarios bajo metodología FIFO, compras, facturación y reportería analítica ejecutiva.

Desplegado en producción sobre **Render**:  
🔗 **Aplicación Web en Vivo:** [https://systemmx-web-200684331.onrender.com](https://systemmx-web-200684331.onrender.com)  
🔗 **API Backend Oficial:** [https://systemmx-api-200684331.onrender.com/api](https://systemmx-api-200684331.onrender.com/api)  
🔗 **Salud de la API:** [https://systemmx-api-200684331.onrender.com/api/health](https://systemmx-api-200684331.onrender.com/api/health)  

---

## 🚀 Tecnologías Principales

- **React 19** (`react` / `react-dom` 19.2.0)
- **TypeScript 5.9** (Tipado estático riguroso)
- **Vite 7** (Compilación y HMR ultrarrápido)
- **Tailwind CSS 4** (Diseño responsive y accesible)
- **React Router 7** (`HashRouter` optimizado para CDN y hosting estático)
- **i18next** (Internacionalización completa: Español, English, Português)
- **UserWay** (Accesibilidad WCAG 2.2 AAA en vivo)
- **Vitest 5 + Testing Library + axe-core** (249 pruebas automatizadas)
- **GitHub Actions** (Integración Continua automatizada en `.github/workflows/frontend-ci.yml`)

---

## 🛠️ Inicio Rápido en Desarrollo Local

### 1. Requisitos Previos
- Node.js `v20.x` o superior (probado en Node v22 y v26)
- npm `10.x` o superior

### 2. Instalación de Dependencias
```bash
npm ci
```

### 3. Configuración de Variables de Entorno
Copie el archivo de ejemplo:
```powershell
cp .env.example .env
```
Defina la URL de la API:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Ejecución en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

## 🧪 Pruebas Automatizadas y Calidad

```bash
# Ejecutar suite de pruebas con Vitest (249 pruebas)
npm test -- --run

# Auditoría estática con ESLint (0 errores, 0 advertencias)
npm run lint

# Compilar paquete de producción (TypeScript + Vite)
npm run build
```

---

## 📚 Documentación Oficial del Proyecto

La documentación técnica, de usuario y de evaluación se encuentra centralizada en la carpeta [`docs/final/`](docs/final/):

- [`00-AUDITORIA-INICIAL.md`](docs/final/00-AUDITORIA-INICIAL.md): Auditoría técnica inicial y diagnóstico de línea base.
- [`01-ARQUITECTURA-Y-TECNOLOGIAS.md`](docs/final/01-ARQUITECTURA-Y-TECNOLOGIAS.md): Arquitectura C4, modelo de datos ER y justificación de decisiones técnicas.
- [`02-MANUAL-INSTALACION-Y-DESPLIEGUE.md`](docs/final/02-MANUAL-INSTALACION-Y-DESPLIEGUE.md): Guía de instalación paso a paso en local y despliegue en Render.
- [`03-MANUAL-TECNICO-Y-SEGURIDAD.md`](docs/final/03-MANUAL-TECNICO-Y-SEGURIDAD.md): Modelo RBAC de 5 roles, autenticación JWT, Argon2id y auditoría forense.
- [`04-MANUAL-DE-USUARIO.md`](docs/final/04-MANUAL-DE-USUARIO.md): Guía funcional paso a paso para usuarios finales y operadores.
- [`05-MATRIZ-FUNCIONAL-Y-PRUEBAS.md`](docs/final/05-MATRIZ-FUNCIONAL-Y-PRUEBAS.md): Matriz de trazabilidad y evidencia de 929 pruebas aprobadas.
- [`06-GUION-EXPOSICION-15MIN-RUBRICAS.md`](docs/final/06-GUION-EXPOSICION-15MIN-RUBRICAS.md): Guion cronometrado minuto a minuto alineado con las rúbricas evaluativas (100 pts presentación + 100 pts software).
- [`SEGUIMIENTO-ENTREGA.md`](docs/final/SEGUIMIENTO-ENTREGA.md): Bitácora acumulativa de fases ejecutadas y commits realizados.

---

## 👥 Equipo de Desarrollo

Proyecto desarrollado para la evaluación final de Ingeniería de Software — Noviembre 2026.
