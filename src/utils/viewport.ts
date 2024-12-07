export function setupViewportHeight() {
  const updateVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Initial set
  updateVh();

  // Update on resize and orientation change
  window.addEventListener('resize', updateVh);
  window.addEventListener('orientationchange', () => {
    // Small delay to ensure the orientation change is complete
    setTimeout(updateVh, 100);
  });

  // Optional: Update on page load and when page is fully loaded
  window.addEventListener('load', updateVh);
  if (document.readyState === 'complete') {
    updateVh();
  } else {
    document.addEventListener('DOMContentLoaded', updateVh);
  }
}
