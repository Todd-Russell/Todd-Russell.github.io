#!/usr/bin/env node
/* build.js — pre-renders portfolio content into static HTML.
   1. Validates resume.json and projects.json by parsing them (hard fail on invalid JSON).
   2. Uses render.js (shared with the browser) to pre-render every section into the
      SSR fences in index.html and resume.html, so the page is full of real content
      even with JavaScript disabled (good for crawlers, link previews, and ATS tools).
   3. Inlines the JSON so the browser hydrates without a second network request.
   Run:  node build.js     (from the portfolio/ folder) */
'use strict';
var fs = require('fs');
var path = require('path');
var R = require('./render.js');
var DIR = __dirname;

function loadValidJSON(file) {
  var raw = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error('Invalid JSON in ' + path.basename(file) + ': ' + e.message + '. Fix it before committing.');
  }
}

function esc$(s) { return String(s).replace(/\$/g, '$$$$'); } // escape $ for String.replace replacement

function inject(html, key, content) {
  var re = new RegExp('(<!--SSR:' + key + ':START-->)[\\s\\S]*?(<!--SSR:' + key + ':END-->)');
  if (!re.test(html)) throw new Error('SSR marker missing: ' + key);
  return html.replace(re, '$1' + esc$(content) + '$2');
}

function injectData(html, resume, projects) {
  // Escape characters that are valid in JSON but unsafe inside an inline <script>:
  // "<" (avoid a </script> breakout) and the U+2028 / U+2029 line terminators.
  function safe(o) {
    var s = JSON.stringify(o);
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var code = s.charCodeAt(i);
      if (code === 0x3c || code === 0x2028 || code === 0x2029) {
        out += '\\u' + ('000' + code.toString(16)).slice(-4);
      } else {
        out += s.charAt(i);
      }
    }
    return out;
  }
  var payload = 'window.__RESUME__=' + safe(resume) + ';';
  if (projects) payload += 'window.__PROJECTS__=' + safe(projects) + ';';
  var re = /(\/\*SSR:data:START\*\/)[\s\S]*?(\/\*SSR:data:END\*\/)/;
  if (!re.test(html)) throw new Error('data marker missing');
  return html.replace(re, '$1' + esc$(payload) + '$2');
}

console.log('Building portfolio...');
var resume = loadValidJSON(path.join(DIR, 'resume.json'));
var projects = loadValidJSON(path.join(DIR, 'projects.json'));
console.log('  JSON parse check passed: resume.json, projects.json');

// ---- index.html ----
var idx = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
idx = inject(idx, 'hero-tagline', R.esc(resume.tagline));
idx = inject(idx, 'hero-desc', R.buildHeroDesc(resume));
idx = inject(idx, 'stats', R.buildStats(resume.stats));
idx = inject(idx, 'proj-tabs', R.buildTabs(projects));
var firstCat = R.firstCategory(projects) || 'Work';
var pr = R.buildProjects(projects, firstCat);
idx = inject(idx, 'proj-spotlight', pr.spotlight);
idx = inject(idx, 'proj-grid', pr.grid);
idx = inject(idx, 'proj-additional', pr.additional);
idx = inject(idx, 'contact', R.buildContact(resume));
idx = injectData(idx, resume, projects);
fs.writeFileSync(path.join(DIR, 'index.html'), idx);
console.log('  Pre-rendered index.html (' + idx.length + ' bytes)');

// ---- resume.html ----
var res = fs.readFileSync(path.join(DIR, 'resume.html'), 'utf8');
res = inject(res, 'hero-tagline', R.esc(resume.tagline));
res = inject(res, 'hero-desc', R.buildHeroDesc(resume));
res = inject(res, 'stats', R.buildStats(resume.stats));
res = inject(res, 'experience', R.buildExperience(resume));
var edu = R.buildEducation(resume);
res = inject(res, 'edu-grid', edu.grid);
res = inject(res, 'coursework', edu.coursework);
res = inject(res, 'skills', R.buildSkills(resume));
res = inject(res, 'publications', R.buildPublications(resume));
res = inject(res, 'contact', R.buildContact(resume));
res = injectData(res, resume, null); // resume.html does not render projects; omit the projects payload
fs.writeFileSync(path.join(DIR, 'resume.html'), res);
console.log('  Pre-rendered resume.html (' + res.length + ' bytes)');
console.log('Done. Commit index.html, resume.html, render.js, the JSON files, and assets/.');
