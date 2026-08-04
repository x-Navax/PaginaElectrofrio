# Sitio web de Electrofrío

Proyecto separado en HTML, CSS y JavaScript.

## Archivos

- `index.html`: estructura de la página.
- `css/styles.css`: diseño, colores y adaptación a celulares.
- `js/app.js`: conexión con Google Sheets, filtros, productos y WhatsApp.
- `productos-ejemplo.csv`: ejemplo de cómo debe estar armada la hoja.

## 1. Preparar Google Sheets

Creá una hoja llamada `Productos` con estos encabezados en la primera fila:

| id | nombre | categoria | precio | imagen | descripcion | destacado | stock | marca |
|---|---|---|---|---|---|---|---|---|

Ejemplo:

| 1 | Disyuntor Schneider 2P | Electricidad | 78500 | URL de la imagen | Descripción | SI | Disponible | Schneider |

En `destacado` escribí `SI` para que el producto aparezca arriba.

## 2. Publicar la planilla

1. En Google Sheets entrá a **Archivo > Compartir > Publicar en la web**.
2. Elegí la hoja `Productos`.
3. Publicala.
4. Copiá el ID de la planilla desde su URL.

La URL final que debe colocarse en `js/app.js` tiene este formato:

```text
https://docs.google.com/spreadsheets/d/ID_DE_TU_PLANILLA/gviz/tq?tqx=out:csv&sheet=Productos
```

Buscá esta parte dentro de `js/app.js`:

```js
googleSheetsCsvUrl: "",
```

Y pegá la URL entre las comillas.

## 3. Configurar WhatsApp

Dentro de `js/app.js`, buscá:

```js
whatsappNumber: "5493487000000",
```

Reemplazalo por el número real con código de país, sin `+`, espacios ni guiones.

Para Argentina normalmente se usa:

```text
549 + código de área + número
```

## 4. Imágenes reales

En la columna `imagen` podés usar:

- Una URL directa de imagen.
- Una imagen alojada en tu web.
- Un enlace compartido de Google Drive.

Para Google Drive, configurá la imagen como “Cualquier persona con el enlace” y pegá el enlace en la celda. El JavaScript intenta convertirlo automáticamente para mostrarla.

Para mayor estabilidad conviene usar imágenes subidas a Cloudinary, Firebase Storage, un hosting propio o URLs directas de proveedores.

## 5. Probar el sitio

Podés abrir `index.html` directamente. Para evitar restricciones del navegador con algunas URLs, es mejor usar un servidor local.

Con Visual Studio Code:
1. Instalá la extensión **Live Server**.
2. Hacé clic derecho sobre `index.html`.
3. Elegí **Open with Live Server**.

## 6. Publicar gratis

Opciones sencillas:

- Netlify
- GitHub Pages
- Cloudflare Pages

Subí la carpeta completa manteniendo la estructura de subcarpetas.

## Personalización

Los colores principales están al comienzo de `css/styles.css`:

```css
:root {
  --primary: #075ca8;
  --primary-dark: #073b68;
  --accent: #00a8e8;
}
```

También podés reemplazar el bloque con las letras `EF` por el logo real de Electrofrío.
