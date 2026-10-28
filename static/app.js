// Confirmación opcional antes de enviar (data-confirmar="texto").
document.addEventListener('submit', function (e) {
  var msg = e.target.dataset.confirmar;
  if (msg && !window.confirm(msg)) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}, true);

// Evita el doble toque en el navegador. La protección real está en el servidor
// (clave de operación única), esto solo mejora la experiencia.
function habilitar(form) {
  delete form.dataset.enviando;
  form.querySelectorAll('button[type="submit"]').forEach(function (b) {
    b.disabled = false;
    if (b.dataset.texto) b.textContent = b.dataset.texto;
  });
}

document.addEventListener('submit', function (e) {
  var form = e.target;
  if (form.dataset.enviando === '1') { e.preventDefault(); return; }
  form.dataset.enviando = '1';
  form.querySelectorAll('button[type="submit"]').forEach(function (b) {
    b.dataset.texto = b.textContent;
    b.disabled = true;
    b.textContent = 'Enviando…';
  });
  // Una descarga no cambia de página: el botón se rehabilita solo.
  if (form.hasAttribute('data-descarga')) setTimeout(function () { habilitar(form); }, 3000);
});

// Al volver con el botón "atrás" el navegador puede restaurar la página con los botones deshabilitados.
window.addEventListener('pageshow', function () {
  document.querySelectorAll('form[data-enviando="1"]').forEach(habilitar);
});

// "Usar mi ubicación actual" en la carga de ubicaciones del comercio.
document.querySelectorAll('[data-geo]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var destino = document.getElementById(btn.dataset.geo);
    var nota = document.getElementById(btn.dataset.geoNota);
    if (!navigator.geolocation) { alert('Este navegador no permite obtener la ubicación.'); return; }
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(function (p) {
      destino.value = p.coords.latitude.toFixed(6) + ', ' + p.coords.longitude.toFixed(6);
      if (nota) nota.textContent = 'Precisión informada por el navegador: ±' + Math.round(p.coords.accuracy) + ' m. Comprobala en el mapa antes de guardar.';
      btn.disabled = false;
    }, function (err) {
      alert('No se pudo obtener la ubicación: ' + err.message + '. (Requiere HTTPS o localhost y permiso del navegador.)');
      btn.disabled = false;
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  });
});
