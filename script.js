const progressEl = document.getElementById('progress');
const toggle = document.getElementById('modeToggle');

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
  progressEl.textContent = percent + '%';
  
  // Optional: Change toggle color when scrolling past hero
  // const heroHeight = document.querySelector('.hero').offsetHeight;
  // if(scrollTop > heroHeight) {
  //   toggle.style.color = 'var(--text-main)';
  //   toggle.style.borderColor = 'var(--accent)';
  // } else {
  //   // Reset to white for hero overlay
  //   if (window.innerWidth > 600) {
  //      toggle.style.color = '#fff';
  //      toggle.style.borderColor = 'rgba(255,255,255,0.3)';
  //   }
  // }
}

window.addEventListener('scroll', updateProgress);
window.addEventListener('load', updateProgress);

toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  
  const isDark = document.body.classList.contains('dark');
  toggle.textContent = isDark ? 'Dark mode' : 'Light mode';
});
