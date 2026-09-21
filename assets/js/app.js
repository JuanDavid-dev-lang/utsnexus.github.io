/* Punto de entrada. Cada módulo mira si su trozo de página existe y, si no,
   no hace nada: el mismo archivo sirve a la portada, al documento y a la 404.

   Va como módulo (`type="module"`): se descarga en paralelo con el HTML y
   corre después de construir el árbol, sin bloquear la primera pintura. */
import { iniciarTema } from './tema.js';
import { iniciarMenu } from './menu.js';
import { iniciarBarra } from './barra.js';
import { iniciarRevelar } from './revelar.js';
import { iniciarPlanilla } from './planilla.js';
import { iniciarDescargas } from './descargas.js';
import { iniciarNovedades } from './novedades.js';
import { iniciarPestanas } from './pestanas.js';

iniciarTema();
iniciarMenu();
iniciarBarra();
iniciarPestanas();
iniciarRevelar();
iniciarPlanilla();
iniciarDescargas();
iniciarNovedades();
