/*
 * Fills the page from the JSON files in /data.
 *   index.html  = structure + <template> markup
 *   css/        = look
 *   js/         = behaviour (this file renders, signal.js animates)
 *   data/*.json = all the words, links and file names
 *
 * Attributes used in index.html:
 *   data-f="field"      set the element's text (element is removed if the field is empty)
 *   data-href / data-src / data-alt / data-download / data-id = "field"   set that attribute
 *   data-ext="field"    open in a new tab when the field is true
 *   data-list="name" data-tpl="template-id"   repeat a <template> for each item
 */
(function () {
  'use strict';

  var FILES = ['site', 'projects', 'training', 'education', 'certificates', 'skills', 'recognition'];

  function get(obj, path) {
    return path.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, obj);
  }
  function empty(v) { return v == null || v === '' || (Array.isArray(v) && !v.length); }

  // Fill every data-* binding inside `root` using values from `ctx`.
  function bind(root, ctx) {
    root.querySelectorAll('[data-f]').forEach(function (n) {
      var v = get(ctx, n.dataset.f);
      if (empty(v)) { n.remove(); return; }
      n.textContent = Array.isArray(v) ? v.join(', ') : String(v);
    });
    ['src', 'alt', 'download', 'id'].forEach(function (attr) {
      root.querySelectorAll('[data-' + attr + ']').forEach(function (n) {
        var v = get(ctx, n.getAttribute('data-' + attr));
        if (empty(v)) n.removeAttribute(attr); else n.setAttribute(attr, v);
      });
    });
    root.querySelectorAll('[data-href]').forEach(function (n) {
      var v = get(ctx, n.dataset.href);
      if (empty(v)) n.replaceWith.apply(n, n.childNodes);   // no link: keep the text, drop the <a>
      else n.setAttribute('href', v);
    });
    root.querySelectorAll('[data-ext]').forEach(function (n) {
      if (get(ctx, n.dataset.ext)) { n.target = '_blank'; n.rel = 'noopener'; }
    });
  }

  function renderList(el, items) {
    var tpl = document.getElementById(el.dataset.tpl);
    var frag = document.createDocumentFragment();
    items.forEach(function (item) {
      var node = tpl.content.cloneNode(true);
      bind(node, item);
      frag.appendChild(node);
    });
    el.replaceChildren(frag);
  }

  function render(d) {
    var site = d.site;
    site.emailHref = 'mailto:' + site.email;

    var external = function (l) { return { label: l.label, url: l.url, ext: true }; };
    var lists = {
      heroLinks: [{ label: 'Email', url: site.emailHref }]
        .concat(site.links.map(external), [
          { label: 'Preview resume', url: '#resume' },
          { label: 'Download resume', url: site.resume.pdf, download: site.resume.filename }
        ]),
      contactLinks: [{ label: site.phone.display, url: site.phone.href }].concat(site.links.map(external)),
      resumePages: site.resume.pages,
      projects: d.projects,
      training: d.training,
      education: d.education,
      skills: d.skills,
      recognition: d.recognition,
      certificates: d.certificates.map(function (c) {
        return Object.assign({}, c, { hash: '#' + c.id, caption: c.title + ', ' + c.date });
      })
    };

    bind(document, site);
    document.querySelectorAll('[data-list]').forEach(function (el) {
      renderList(el, lists[el.dataset.list] || []);
    });
  }

  function done() {
    document.documentElement.classList.add('ready');
    // Content didn't exist when the browser first looked for #resume, #c1, #projects...
    // so re-apply the address-bar hash now that it does.
    var h = location.hash;
    if (h.length > 1) { location.hash = ''; location.hash = h; }
  }

  function fail(err) {
    console.error(err);
    var p = document.createElement('p');
    p.className = 'err';
    p.textContent = 'Could not load the portfolio content (' + err.message + '). ' +
      'If you opened index.html straight from a folder, serve the folder instead: ' +
      'run "python3 -m http.server" inside it and visit http://localhost:8000.';
    document.querySelector('main').prepend(p);
    document.documentElement.classList.add('ready');
  }

  Promise.all(FILES.map(function (name) {
    return fetch('data/' + name + '.json').then(function (r) {
      if (!r.ok) throw new Error(name + '.json ' + r.status);
      return r.json();
    });
  })).then(function (parts) {
    var d = {};
    FILES.forEach(function (name, i) { d[name] = parts[i]; });
    render(d);
    done();
  }).catch(fail);
})();
