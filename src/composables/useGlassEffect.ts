import { ref, watch } from "vue";

const glassIntensity = ref(70);

try {
  const saved = localStorage.getItem("glass-intensity");
  if (saved !== null) {
    glassIntensity.value = Math.max(0, Math.min(100, parseInt(saved, 10)));
  }
} catch {}

function applyToCss(value: number) {
  const root = document.documentElement;
  const blur = 14 + value * 0.12;
  const opacity = 0.50 + value * 0.0025;
  root.style.setProperty("--glass-blur", `${blur}px`);
  root.style.setProperty("--glass-opacity", `${opacity}`);
}

applyToCss(glassIntensity.value);

watch(glassIntensity, (val) => {
  applyToCss(val);
  try {
    localStorage.setItem("glass-intensity", String(val));
  } catch {}
});

export function useGlassEffect() {
  function setGlassIntensity(value: number) {
    glassIntensity.value = Math.max(0, Math.min(100, Math.round(value)));
  }

  return {
    glassIntensity,
    setGlassIntensity,
  };
}
