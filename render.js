/* render.js — shared rendering for Todd Russell's portfolio.
   Pure HTML-string builders used by BOTH the browser (window.PortfolioRender)
   and the Node build script (build.js) so there is a single source of truth.
   No DOM access here. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.PortfolioRender = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  };

  var MAIN_WORK_IDS = ['module-efficiency', 'laser-scribing', 'dmc-tray-scanner', 'large-module-photobooth', 'f35-analysis', 'icp-prototype', 'no-pollution'];
  function isMainWork(id) { return MAIN_WORK_IDS.indexOf(id) !== -1; }

  function visual(p) {
    if (p.image && p.cadImage) {
      return '<div class="imgwrap img-compare" data-compare="1">' +
        '<img class="shot" src="' + esc(p.image) + '" alt="' + esc(p.title) + ' — build" loading="lazy">' +
        '<div class="compare-over"><img src="' + esc(p.cadImage) + '" alt="' + esc(p.title) + ' — CAD" loading="lazy"></div>' +
        '<div class="compare-handle" role="slider" tabindex="0" aria-label="Reveal CAD versus build comparison for ' + esc(p.title) + '" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"></div>' +
        '<span class="compare-label compare-label-l">CAD</span><span class="compare-label compare-label-r">Build</span></div>';
    }
    if (p.image) return '<div class="imgwrap"><img class="shot" src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy"></div>';
    if (p.metric) return '<div class="tile"><div class="tile-v">' + esc(p.metric.value) + '</div><div class="tile-l">' + esc(p.metric.label) + '</div></div>';
    return '<div class="tile mono"><span>' + esc(p.category) + ' project</span></div>';
  }

  function embedBlock(p) {
    var html = '';
    if (p.video) {
      html += '<div class="embed-video"><video controls preload="metadata"><source src="' + esc(p.video) + '" type="video/mp4">Your browser does not support the video tag.</video></div>';
      if (p.youtubeUrl) html += '<div style="margin-top:0.5rem"><a href="' + esc(p.youtubeUrl) + '" target="_blank" rel="noopener noreferrer" style="font-family:var(--mono);font-size:0.64rem;letter-spacing:0.06em;color:var(--accent)">Watch on YouTube &rarr;</a></div>';
    }
    if (p.pdf) html += '<div class="embed-pdf-wrap"><button class="embed-pdf-toggle" data-pdf="' + esc(p.pdf) + '">View Report</button><a class="embed-pdf-dl" href="' + esc(p.pdf) + '" download>Download PDF</a><div class="embed-pdf-frame"><iframe src="' + esc(p.pdf) + '" loading="lazy" title="' + esc(p.title) + ' report"></iframe></div></div>';
    return html;
  }

  function parBlock(p) {
    if (!p.par && !p.video && !p.pdf) return '';
    var rows = '';
    if (p.par) {
      var pairs = [['Problem', p.par.problem], ['Action', p.par.action], ['Result', p.par.result]];
      rows = pairs.filter(function (r) { return r[1]; }).map(function (r) {
        return '<div class="par-row"><span class="k">' + r[0] + '</span><span class="v">' + esc(r[1]) + '</span></div>';
      }).join('');
    }
    return '<div class="pdetail"><div class="pdetail-in"><div class="par-block">' + rows + embedBlock(p) +
      '<button class="pless" data-collapse="1"><span>Show less</span><span class="pmore-ic" style="transform:rotate(45deg)">+</span></button></div></div></div>';
  }

  function tags(p) { return '<div class="ptags">' + (p.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>'; }
  function moreBtn(p) { return (p.par || p.video || p.pdf) ? '<div class="pmore"><span>Details</span><span class="pmore-ic">+</span></div>' : ''; }
  function spotBadge(p) {
    if (p.image && p.metric) return '<div class="spot-badge"><span class="spot-badge-v">' + esc(p.metric.value) + '</span><span class="spot-badge-l">' + esc(p.metric.label) + '</span></div>';
    return '';
  }

  function spotlightCard(p) {
    var hasDetail = p.par || p.video || p.pdf;
    var ex = hasDetail ? ' expandable' : '';
    return '<article class="pcard spotlight' + ex + '" ' + (hasDetail ? 'tabindex="0" role="button" aria-expanded="false"' : '') + '>' +
      '<div class="spot-visual">' + visual(p) + spotBadge(p) + '</div>' +
      '<div class="spot-body">' +
      '<div class="spot-flag">&#9733; Featured</div>' +
      '<div class="spot-meta">' + esc(p.company) + ' &mdash; ' + esc(p.year) + '</div>' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<p class="spot-sum">' + esc(p.summary) + '</p>' +
      tags(p) + moreBtn(p) +
      '</div>' + parBlock(p) + '</article>';
  }

  function gridCard(p) {
    var hasDetail = p.par || p.video || p.pdf;
    var ex = hasDetail ? ' expandable' : '';
    return '<article class="pcard' + ex + '" ' + (hasDetail ? 'tabindex="0" role="button" aria-expanded="false"' : '') + '>' +
      visual(p) +
      '<div class="pbody">' +
      '<div class="pmeta"><span>' + esc(p.company) + '</span><span>' + esc(p.year) + '</span></div>' +
      '<h3 class="ptitle">' + esc(p.title) + '</h3>' +
      '<p class="psum">' + esc(p.summary) + '</p>' +
      tags(p) + moreBtn(p) + parBlock(p) +
      '</div></article>';
  }

  function buildHeroDesc(r) { return (r.descriptors || []).map(function (d) { return '<span>' + esc(d) + '</span>'; }).join(''); }
  function buildStats(stats) {
    return (stats || []).map(function (s) {
      return '<div class="stat"><div class="stat-value">' + esc(s.value) + '</div><div class="stat-label">' + esc(s.label) + '</div></div>';
    }).join('');
  }

  function categories(projects) {
    var order = ['Work', 'Class', 'Club', 'Personal'];
    return order.filter(function (c) { return projects.some(function (p) { return p.category === c; }); });
  }
  function buildTabs(projects) {
    return categories(projects).map(function (c, i) {
      return '<button class="proj-tab' + (i === 0 ? ' on' : '') + '" data-cat="' + c + '">' + c + '</button>';
    }).join('');
  }
  function firstCategory(projects) { return categories(projects)[0] || null; }

  function byYearDesc(a, b) { return parseInt(b.year, 10) - parseInt(a.year, 10); }

  function buildProjects(projects, cat) {
    var items = projects.filter(function (p) { return p.category === cat; });
    var main, additional = [];
    if (cat === 'Work') {
      main = items.filter(function (p) { return isMainWork(p.id); });
      additional = items.filter(function (p) { return !isMainWork(p.id); });
    } else { main = items; }
    var featured = main.filter(function (p) { return p.featured; })[0] || main[0] || null;
    var rest = main.filter(function (p) { return p !== featured; }).sort(byYearDesc);
    var spotlight = featured ? spotlightCard(featured) : '';
    var colL = rest.filter(function (_, i) { return i % 2 === 0; });
    var colR = rest.filter(function (_, i) { return i % 2 === 1; });
    var grid = '<div class="proj-col">' + colL.map(gridCard).join('') + '</div><div class="proj-col">' + colR.map(gridCard).join('') + '</div>';
    var additionalHTML = '';
    if (additional.length) {
      additional.sort(byYearDesc);
      var addL = additional.filter(function (_, i) { return i % 2 === 0; });
      var addR = additional.filter(function (_, i) { return i % 2 === 1; });
      additionalHTML = '<div class="additional-wrap">' +
        '<button class="additional-toggle" id="additional-toggle" aria-expanded="false"><span>Additional CubicPV Projects (' + additional.length + ')</span><span class="at-ic">+</span></button>' +
        '<div class="additional-grid" id="additional-grid"><div class="proj-col">' + addL.map(gridCard).join('') + '</div><div class="proj-col">' + addR.map(gridCard).join('') + '</div></div></div>';
    }
    return { spotlight: spotlight, grid: grid, additional: additionalHTML };
  }

  function buildContact(r) {
    var out = '<a class="btn-primary" href="mailto:' + esc(r.email) + '">' + esc(r.email) + '</a>';
    if (r.resumePdf) out += '<a class="btn-outline" href="' + esc(r.resumePdf) + '" download>Download Resume (PDF)</a>';
    out += '<a class="btn-outline" target="_blank" rel="noopener noreferrer" href="' + esc(r.linkedin) + '">LinkedIn Profile</a>';
    return out;
  }

  function buildExperience(r) {
    return (r.experience || []).map(function (e) {
      var right = '<div class="exp-role">' + esc(e.role) + '</div>';
      if (e.intro) right += '<div class="exp-intro">' + esc(e.intro) + '</div>';
      if (e.groups && e.groups.length) {
        right += e.groups.map(function (g) {
          return '<div class="exp-group">' +
            '<div class="exp-group-name">' + esc(g.name) + '</div>' +
            '<ul class="exp-bullets">' + (g.bullets || []).map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' +
            '</div>';
        }).join('');
      } else {
        right += '<ul class="exp-bullets">' + (e.highlights || []).map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>';
      }
      return '<div class="exp-item reveal">' +
        '<div><div class="exp-co">' + esc(e.company) + '</div>' +
        '<div class="exp-period">' + esc(e.period) + '</div>' +
        '<div class="exp-loc">' + esc(e.location) + '</div></div>' +
        '<div>' + right + '</div>' +
        '</div>';
    }).join('');
  }

  function buildEducation(r) {
    var grid = (r.education || []).map(function (e) {
      return '<div class="edu-card reveal">' +
        '<div class="edu-school">' + esc(e.school) + '</div>' +
        '<div class="edu-degree">' + esc(e.degree) + '</div>' +
        '<div class="edu-period">' + esc(e.period) + '</div>' +
        (e.details ? '<div class="edu-details">' + esc(e.details) + '</div>' : '') +
        '</div>';
    }).join('');
    var highlighted = r.highlightedCoursework || [];
    var all = r.coursework || [];
    var rest = all.filter(function (c) { return highlighted.indexOf(c) === -1; });
    var coursework = '<div class="courses-label">Applicable Coursework</div>' +
      '<div class="courses-cap">Highlighted courses are most relevant to my current work.</div>' +
      '<div class="courses-pills">' + highlighted.map(function (c) { return '<span class="course-pill highlighted">' + esc(c) + '</span>'; }).join('') + '</div>' +
      '<div class="courses-rest" id="courses-rest">' + rest.map(function (c) { return '<span class="course-pill">' + esc(c) + '</span>'; }).join('') + '</div>' +
      '<button class="courses-toggle" id="courses-toggle" aria-expanded="false"><span>Show all coursework (' + all.length + ')</span><span class="ct-ic">+</span></button>';
    return { grid: grid, coursework: coursework };
  }

  function buildSkills(r) {
    var s = r.skills || {};
    return Object.keys(s).map(function (cat) {
      return '<div><div class="skill-cat">' + esc(cat) + '</div><div class="skill-pills">' +
        s[cat].map(function (x) { return '<span class="skill-pill">' + esc(x) + '</span>'; }).join('') + '</div></div>';
    }).join('');
  }

  function buildPublications(r) {
    return (r.publications || []).map(function (p) {
      return '<div class="pub reveal">' +
        '<div class="pub-title">' + esc(p.title) + '</div>' +
        '<div class="pub-venue">' + esc(p.venue) + ' &middot; ' + esc(p.year) + '</div>' +
        (p.url ? '<a class="pub-link" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">View publication &rarr;</a>' : '') +
        '</div>';
    }).join('');
  }

  return {
    esc: esc,
    buildHeroDesc: buildHeroDesc,
    buildStats: buildStats,
    buildTabs: buildTabs,
    firstCategory: firstCategory,
    buildProjects: buildProjects,
    buildContact: buildContact,
    buildExperience: buildExperience,
    buildEducation: buildEducation,
    buildSkills: buildSkills,
    buildPublications: buildPublications
  };
}));
