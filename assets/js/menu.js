/* Menú de teléfono.

   Abrir, cerrar, Escape y tocar fuera los hace el navegador con el atributo
   `popover`. Lo único que falta es que al elegir una sección el menú se
   cierre: un enlace a un ancla no cierra el popover por sí solo, y quedaría
   tapando el sitio al que se acaba de ir. */
export function iniciarMenu() {
  const menu = document.getElementById('menu');
  if (!menu || typeof menu.hidePopover !== 'function') return;

  menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) menu.hidePopover();
  });
}
