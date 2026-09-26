// A review control on the demo link only. Normal visits still choose local time.
export function mountRoomPreview({ initial, change }) {
  const params = new URLSearchParams(location.search);
  if (params.get('demo') !== 'reading' || params.get('rooms') !== '1') return;
  const rooms = ['morning', 'afternoon', 'evening', 'night'];
  const nav = document.createElement('nav');
  nav.className = 'room-preview';
  nav.setAttribute('aria-label', 'Preview returning rooms');
  let selected = initial.replace('table-', ''), request = 0;
  for (const room of rooms) {
    const button = document.createElement('button');
    button.textContent = room[0].toUpperCase() + room.slice(1);
    button.dataset.room = room;
    button.setAttribute('aria-pressed', String(selected === room));
    button.onclick = async () => {
      const turn = ++request;
      button.setAttribute('aria-busy', 'true');
      try {
        await change(room, () => turn === request);
        if (turn !== request) return;
        selected = room;
        for (const item of nav.children) item.setAttribute('aria-pressed', String(item.dataset.room === room));
        const url = new URL(location.href); url.searchParams.set('room', room);
        history.replaceState(null, '', url);
      } catch { /* The scene loader reports failure; keep the selected room. */ }
      finally { button.removeAttribute('aria-busy'); }
    };
    nav.append(button);
  }
  // Arrow keys on this control preview rooms; elsewhere they change book pills.
  nav.onkeydown = event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const index = (rooms.indexOf(selected) + (event.key === 'ArrowRight' ? 1 : 3)) % rooms.length;
    nav.children[index].focus(); nav.children[index].click();
  };
  document.body.append(nav);
}
