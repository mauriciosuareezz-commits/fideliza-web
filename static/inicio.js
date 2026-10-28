// Movimiento de la página de inicio. Sin JS o con "reducir movimiento", todo se ve quieto y completo desde el principio.
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-revelar');

  // Títulos: cada palabra (o cada cursiva entera) va en su caja para subir una detrás de otra.
  function envolver(nodo, n) {
    var caja = document.createElement('span');
    var interior = document.createElement('span');
    caja.className = 'pal';
    interior.style.setProperty('--n', n);
    caja.appendChild(interior);
    interior.appendChild(nodo);
    return caja;
  }
  document.querySelectorAll('.dividir').forEach(function (titulo) {
    var n = 0;
    Array.prototype.slice.call(titulo.childNodes).forEach(function (nodo) {
      if (nodo.nodeType === Node.TEXT_NODE) {
        var partes = document.createDocumentFragment();
        nodo.textContent.split(/(\s+)/).forEach(function (parte) {
          if (!parte) return;
          partes.appendChild(/^\s+$/.test(parte) ? document.createTextNode(parte) : envolver(document.createTextNode(parte), n++));
        });
        titulo.replaceChild(partes, nodo);
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        var caja = envolver(document.createTextNode(''), n++);
        titulo.replaceChild(caja, nodo);
        caja.firstChild.replaceChild(nodo, caja.firstChild.firstChild);
      }
    });
  });

  // Aparición al bajar.
  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observador.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  document.querySelectorAll('.revelar').forEach(function (el) { observador.observe(el); });

  // El celular de la portada se inclina un poco hacia donde está el mouse.
  var portada = document.querySelector('.portada');
  var inclinar = document.querySelector('[data-inclinar]');
  if (portada && inclinar && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    portada.addEventListener('pointermove', function (e) {
      var caja = portada.getBoundingClientRect();
      var x = (e.clientX - caja.left) / caja.width - 0.5;
      var y = (e.clientY - caja.top) / caja.height - 0.5;
      inclinar.style.setProperty('--ry', (x * 16).toFixed(2) + 'deg');
      inclinar.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
    });
    portada.addEventListener('pointerleave', function () {
      inclinar.style.removeProperty('--ry');
      inclinar.style.removeProperty('--rx');
    });
  }

  // La línea celeste de la barra muestra cuánto bajaste, y la cinta de rubros se inclina con la velocidad.
  var progreso = document.querySelector('.progreso');
  var cinta = document.querySelector('.cinta-sesgo');
  var anterior = window.scrollY;
  var sesgo = 0;
  var corriendo = false;
  function cuadro() {
    var y = window.scrollY;
    var recorrido = document.documentElement.scrollHeight - window.innerHeight;
    if (progreso) progreso.style.transform = 'scaleX(' + (recorrido > 0 ? Math.min(1, y / recorrido) : 0).toFixed(4) + ')';
    sesgo += (Math.max(-9, Math.min(9, (y - anterior) * 0.4)) - sesgo) * 0.18;
    anterior = y;
    if (Math.abs(sesgo) > 0.05) {
      if (cinta) cinta.style.setProperty('--sesgo', (-sesgo).toFixed(2) + 'deg');
      requestAnimationFrame(cuadro);
    } else {
      sesgo = 0;
      if (cinta) cinta.style.removeProperty('--sesgo');
      corriendo = false;
    }
  }
  window.addEventListener('scroll', function () {
    if (!corriendo) {
      corriendo = true;
      requestAnimationFrame(cuadro);
    }
  }, { passive: true });
  cuadro();
})();
