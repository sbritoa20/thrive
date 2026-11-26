# Thrive: instrucciones para Claude

App personal para el celular (PWA, en español) para llevar horas de trabajo, plata y gym. La usa una sola persona en su Android. Háblale en español y sin tecnicismos innecesarios.

## Si es la primera vez en este computador

1. Clona el repositorio, si todavía no está: `git clone https://github.com/sbritoa20/thrive.git Thrive` y abre esa carpeta.
2. Revisa `git config user.name`. Debe ser el mismo nombre de los commits que ya existen (`git log -1 --format=%an`). Si no hay correo configurado, pregúntale al usuario cuál usar; no lo inventes.
3. Comprueba que existan Node (`node -v`) y git. No hay dependencias que instalar: no hay `package.json` ni build.
4. Crea `.claude/launch.json` si no existe, con una configuración "thrive" que corra `node serve.js` en el puerto 5173, y abre la app con la vista previa para confirmar que carga.
5. La primera vez que hagas `git push` puede que GitHub pida iniciar sesión: eso lo hace el usuario.

## Reglas

- **Nunca te pongas como colaborador.** Nada de `Co-Authored-By`, "Generated with Claude" ni líneas de atribución en commits o PRs.
- Commits cortos en español, directo sobre `main` (así se ha trabajado). Haz commit y push solo cuando el cambio esté probado.
- Todo el texto de la app va en español de Colombia; la plata en pesos colombianos (`money()`), los dólares con `usd()`.
- Los datos del usuario viven solo en su teléfono. Nunca los subas al repo ni los mandes a ningún servicio.

## Cómo se publica

- GitHub Pages publica la carpeta `docs/` de la rama `main` en https://sbritoa20.github.io/thrive/
- Un push a `main` queda en línea en más o menos un minuto. El CDN de GitHub puede seguir entregando el archivo viejo unos minutos más.
- El service worker (`docs/sw.js`) busca siempre la versión nueva cuando hay internet (`cache: 'no-cache'`) y usa la copia guardada sin internet. En el celular basta con cerrar y abrir la app.
- Después de publicar, verifica en la URL en línea que el cambio ya está.

## Estructura

- `docs/index.html`: el armazón: `<main id="view">`, la barra de pestañas (Trabajo, Dinero, Gym, Ajustes) y una hoja inferior `#sheet` para formularios.
- `docs/app.js`: toda la lógica, en JavaScript sin frameworks.
- `docs/styles.css`: tema oscuro con variables (`--accent` naranja, `--in` verde, `--out` rojo, `--save` azul). Pensado para un celular de unos 375 px de ancho.
- `docs/sw.js`, `docs/manifest.webmanifest`, `docs/icons/`: hacen que se instale como app. El logo es "Brote", un brote naranja.
- `serve.js`: servidor local mínimo (`node serve.js`, puerto 5173; se puede cambiar con la variable `PORT`).

### Patrones de app.js

- Estado global `S`, guardado en IndexedDB (base `thrive`, almacén `kv`, clave `state`), con respaldo en `localStorage`. `save()` guarda.
- **Campos nuevos en el estado:** agrégalos a `DEFAULT_STATE` con un valor por defecto. `hydrate()` mezcla lo guardado con esos valores, así no se dañan los datos viejos del usuario. Nunca cambies el significado de un campo que ya existe sin migrar los datos.
- `render()` redibuja la pestaña actual completa (`VIEWS[ui.tab]()`).
- Eventos por delegación: `data-act` → `ACT`, `data-change` → `CHANGE`, `data-submit` → `SUBMIT`.
- Formularios en la hoja inferior con `openSheet()` y `closeSheet()`, que usan `history.pushState` para que el botón atrás de Android funcione.
- Para fechas usa `dateField()`, el calendario propio; no uses el selector nativo del navegador.

## Lógica del negocio

### Trabajo
- Pago por hora en dólares: `settings.rateUsd`, 5 USD por defecto. El dólar está en `settings.fx` (3100 por defecto) y se cambia en Ajustes.
- Horas de media en media hora. Horas con turno y horas sin turno se cuentan aparte, para saber si de verdad le pagan las sin turno.
- Breaks de `settings.breakMin` minutos (5) que se descuentan del pago.
- **La pestaña Trabajo muestra todo en dólares.** Lo que de verdad le pagaron en USD va en `S.receivedUsd[quincena]`, y `paidVerdict()` compara eso con lo calculado y avisa si faltan las horas sin turno.

### Quincenas (`pkey` = `AAAA-MM-1` o `AAAA-MM-2`)
- Quincena vencida: lo trabajado del 1 al 15 se paga el 30 (o el último día del mes); lo del 16 a fin de mes se paga el 15 del mes siguiente (`payDate()`).
- **La plata de un pago cuenta en la quincena que sigue a la fecha del pago** (`moneyP()`): lo que llega el 15 es para el 16–30; lo que llega el 30 es para el 1–15 del mes siguiente. Por eso en `incomeFor(p)` lo trabajado es `pPrev(pPrev(p))` y el sueldo es el de `pPrev(p)`.
- Modo sueldo fijo, para las prácticas: `settings.mode = 'salary'`, `salary` en pesos, quincenal o mensual, con fecha de inicio. Antes de esa fecha sigue contando el trabajo por horas.

### Dinero (en pesos)
- Cada quincena muestra solo lo suyo: ingresos (pago por horas pasado a pesos, sueldo, ingresos extra), gastos, cuotas de deudas y movimientos de ahorro.
- El pago por horas se pasa a pesos con `fx`. Si el usuario escribe los pesos que de verdad le llegaron (`S.received[quincena]`), se usa ese valor.
- Deudas: cuota, frecuencia (pago único, quincenal o mensual), cuántas cuotas faltan y la próxima fecha. Cada quincena muestra sus cuotas con "Ya pagué" y "Deshacer pago". La lista "Todas mis deudas" está plegada abajo.
- Fondo de ahorro (`S.savings`): guardar plata se resta de esa quincena y sacar plata vuelve a ella. No deja guardar más de lo que queda libre en la quincena ni sacar más de lo ahorrado. Tiene una meta opcional (`settings.savingsGoal`).
- La tabla "Próximas quincenas" proyecta 8 quincenas. Si aún no hay horas registradas, estima con `settings.typicalHours`.

### Gym
- Rutinas (A, B…) con ejercicios: series, reps y peso. Las fotos vienen de free-exercise-db (dominio público, en raw.githubusercontent.com, buscable en español); también hay ejercicios propios con su foto.
- Calendario `S.gym[fecha] = idRutina | 'libre'`. La racha cuenta de lunes a viernes; el fin de semana no la rompe.
- Modo entrenamiento: `S.workout` es el entrenamiento en curso. El cronómetro se calcula desde la hora de inicio, así sigue bien aunque se cierre la app. Al terminar se guarda en `S.sessions` y se marca el día en el calendario. Cada serie muestra el peso de la última vez (`lastSets()`) y si subió o bajó.
- En los campos del entrenamiento el evento de cambio no redibuja la pantalla completa; así no se pierde el toque en el ✓.

## Cómo probar

- `node --check docs/app.js` después de editar.
- Abre la app con `node serve.js` y la vista previa. Prueba en tamaño de celular (375 px).
- Los datos de prueba en `localhost` no tocan los del teléfono, pero bórralos al terminar.
- Puedes llamar funciones desde la consola de la página (`incomeFor`, `render`, `S`…) para revisar cálculos.

## Ideas que quedaron pendientes

- Avisos al celular: 4 días antes y el mismo día del vencimiento de una deuda, y un recordatorio diario del gym con "Ya fui" / "No fui hoy". El usuario lo dejó para después. Sin servidor, Android decide la hora del aviso (Periodic Background Sync); para una hora exacta haría falta un servidor de Web Push.
- Convertirla en APK con PWABuilder.
- Cambiar el selector nativo de "Cada cuánto" en las deudas por botones.
