// https://github.com/ai/nanoid/blob/main/LICENSE
const nanoid = (t = 21) => crypto.getRandomValues(new Uint8Array(t)).reduce((t, e) =>(t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e > 62 ? "-" : "_"), "");
const nanoid10 = () => nanoid(10);

(() => {
  let active;
  let item = {};
  let p = [0,0];
  document.addEventListener('mousemove', e => { p = [e.clientX, e.clientY]; });

  window.sSetActive = el => { if (active && active === el.dataset.active) { active = undefined; } else { active = el.dataset.active; } showActive(); };
  window.sClear = () => { active = undefined; item = {}; document.querySelectorAll('.s-content span').forEach(el => el.innerText = ''); };

  const getType = el => {
    let type = 'Hair';
    while (el) {
      const text = el.innerText.toLowerCase();
      console.log(text);
      if (text.includes('hair accessory')) { type = 'Hat'; break; }
      if (text.includes('hair')) { type = 'Hair'; break; }
      if (text.includes('cape')) { type = 'Cape'; break; }
      if (text.includes('mask')) { type = 'Mask'; break; }
      if (text.includes('face accessory')) { type = 'FaceAccessory'; break; }
      if (text.includes('outfit')) { type = 'Outfit'; break; }
      if (text.includes('shoes')) { type = 'Shoes'; break; }
      if (text.includes('necklace') || text.includes('pendant')) { type = 'Necklace'; break; }
      if (text.includes('prop')) { type = 'Prop'; break; }
      if (text.includes('instrument')) { type = 'Instrument'; break; }
      el = el.parentElement;
    }

    item.type = type;
    document.getElementById('s-type').innerText = type;
    updateName();
  };

  function normalizeName(str) { return str.toLowerCase().replace(/\b\w/g, function(char) { return char.toUpperCase(); }); }
  function normalizeType(str) { return str.split(/(?=[A-Z])/).join(' '); }
  const getName = el => { if (el.innerText.length > 100) { return; } item.name = normalizeName(el.innerText); updateName(); };
  const removeDupeWord = str => str.split(' ').filter((v, i, a) => a.indexOf(v) === i).join(' ');
  const updateName = () => {
    let n = '';
    if (item.name && !item.type)  { n = item.name; }
    else if (!item.name && item.type) { n = item.type; }
    else { n = `${item.name} ${normalizeType(item.type)}`; }
    n = removeDupeWord(n);
    document.getElementById('s-name').value = n;
  }

  const getIcon = el => {
    while (el) {
      if (el.tagName !== 'IMG') { el = el.parentElement; continue; }

      let src = el.dataset.src || el.src;
      const i = src.indexOf('/revision/');
      if (i > 0) {
        src = src.substr(0, i);
        item.icon = src;
        document.getElementById('s-icon').innerText = src;
      }
      break;
    }

  };

  const getPreview = el => {
    while (el) {
      if (el.tagName !== 'IMG') { el = el.parentElement; continue; }

      let src = el.dataset.src || el.src;
      const i = src.indexOf('/revision/');
      if (i > 0) {
        src = src.substr(0, i);
        item.previewUrl = src;
        document.getElementById('s-preview').innerText = src;
      }
      break;
    }
  };

  const getImage = el => {
    while (el) {
      if (el.tagName !== 'IMG') { el = el.parentElement; continue; }

      let src = el.dataset.src || el.src;
      const i = src.indexOf('/revision/');
      if (i > 0) {
        src = src.substr(0, i);
        navigator.clipboard.writeText(src);
      }
      break;
    }
  };

  const selectActive = () => {
    const els = document.elementsFromPoint(...p);
    console.log(els);
    const el = els.at(0);

    switch (active) {
      case 'type': getType(el); break;
      case 'name': getName(el); break;
      case 'icon': getIcon(el); break;
      case 'preview': getPreview(el); break;
      case 'image': getImage(el); break;
    }
  };

  const activeNext = () => {
    switch (active) {
      case 'id': active = 'name'; break;
      case 'name': active = 'type'; break;
      case 'type': active = 'icon'; break;
      case 'icon': active = 'preview'; break;
      case 'preview': active = 'id'; break;
    }
    showActive();
  };

  const activePrev = () => {
    switch (active) {
      case 'name': active = 'id'; break;
      case 'type': active = 'name'; break;
      case 'icon': active = 'type'; break;
      case 'preview': active = 'icon'; break;
      case 'id': active = 'preview'; break;
    }
    showActive();
  };

  const showActive = () => {
    document.querySelectorAll('button[data-active]').forEach(el => el.classList.remove('active'));
    if (active) { document.querySelector(`button[data-active="${active}"]`).classList.add('active'); }
  };

  const copyItem = () => {
    const result = {
      id: +document.getElementById('s-id').value || 0,
      guid: nanoid10(),
      type: item.type,
      name: document.getElementById('s-name').value,
      icon: item.icon || '/assets/icons/question.webp',
      previewUrl: item.previewUrl,
      order: 10000
    }
    navigator.clipboard.writeText('\n' + JSON.stringify(result, null, 2) + ',');
  };

  document.addEventListener('keydown', e => {
    if (!active) { return; }
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }

    // Pagedown
    if (active === 'id') {
      const inc = e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0;
      document.getElementById('s-id').value = (+document.getElementById('s-id').value + inc) || 0;
      if (inc) return;
    }

    switch (e.key) {
      case 'ArrowUp': copyItem(); break;
      case 'ArrowDown': selectActive(); break;
      case 'ArrowRight': activeNext(); break;
      case 'ArrowLeft': activePrev(); break;
    }
  });

  document.body.insertAdjacentHTML('beforeend', `<style>
  .s-container {
    position: fixed;
    bottom: 4px;
    right: 4px;
    z-index: 99999;
    padding: 10px;
    background: #ccfbff;
    border-radius: 10px;
    border: 2px solid #78b1b6;
  }

  .s-container .active {
    color: green;
    font-weight: bold;
  }

  </style>
  <div class="s-container">
    <div class="s-content">
      <input type="number" id="s-id" placeholder="ID" style="width: 100px;">
      <div>Type: <span id="s-type"></span></div>
      <div>Name: <input type="text" id="s-name" style="width: 400px;"></div>
      <div>Icon: <span id="s-icon"></span></div>
      <div>Preview: <span id="s-preview"></span></div>
    </div>
    <div>
      <button type="button" data-active="id" onclick="sSetActive(this)">ID</button>
      <button type="button" data-active="name" onclick="sSetActive(this)">Copy name</button>
      <button type="button" data-active="type" onclick="sSetActive(this)">Copy type</button>
      <button type="button" data-active="icon" onclick="sSetActive(this)">Copy icon</button>
      <button type="button" data-active="preview" onclick="sSetActive(this)">Copy preview</button>
      <button type="button" data-active="image" onclick="sSetActive(this)" style="margin-left: 10px;">Copy image</button>
      <button type="button" onclick="sClear()" style="margin-left: 10px;">Clear</button>
    </div>
  </div>
  `);

  document.getElementById('s-id').value = /*S-ID*/2215;
  sSetActive(document.querySelector('button[data-active="name"]'));
})();
