async function loadTemplate(targetId, path) {
  const target = document.getElementById(targetId);
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Fehler: ${path}`);
    target.innerHTML = await response.text();
    target.style.opacity = "1";
  } catch (error) {
    console.error(error);
  }
}