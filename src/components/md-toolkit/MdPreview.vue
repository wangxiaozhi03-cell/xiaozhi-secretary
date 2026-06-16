<script setup lang="ts">
defineProps<{
  html: string;
}>();
</script>

<template>
  <div class="h-full overflow-y-auto bg-white/60 dark:bg-white/[0.02]">
    <div
      class="markdown-body p-6 max-w-none"
      v-html="html"
    />
  </div>
</template>

<style scoped>
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-primary, rgba(0, 0, 0, 0.85));
}

.markdown-body :deep(h1) {
  font-size: 1.75em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.markdown-body :deep(h2) {
  font-size: 1.4em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.markdown-body :deep(h3) { font-size: 1.2em; }
.markdown-body :deep(h4) { font-size: 1em; }

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body :deep(a) {
  color: #3B82F6;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  font-size: 85%;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
  font-family: "SF Mono", "Fira Code", monospace;
}

:global(.dark) .markdown-body :deep(code) {
  background: rgba(255, 255, 255, 0.08);
}

.markdown-body :deep(.hljs-code-block) {
  position: relative;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.5;
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 10px;
  margin-bottom: 16px;
}

.markdown-body :deep(.hljs-code-block .code-lang) {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 11px;
  color: #6c7086;
  text-transform: uppercase;
}

.markdown-body :deep(.hljs-code-block code) {
  padding: 0;
  background: transparent;
  color: inherit;
  font-size: inherit;
}

.markdown-body :deep(blockquote) {
  padding: 0 1em;
  margin: 0 0 16px 0;
  color: rgba(0, 0, 0, 0.5);
  border-left: 0.25em solid rgba(0, 0, 0, 0.1);
}

:global(.dark) .markdown-body :deep(blockquote) {
  color: rgba(255, 255, 255, 0.5);
  border-left-color: rgba(255, 255, 255, 0.1);
}

.markdown-body :deep(table) {
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 8px 13px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.markdown-body :deep(th) {
  font-weight: 600;
  background: rgba(0, 0, 0, 0.02);
}

:global(.dark) .markdown-body :deep(th),
:global(.dark) .markdown-body :deep(td) {
  border-color: rgba(255, 255, 255, 0.08);
}

:global(.dark) .markdown-body :deep(th) {
  background: rgba(255, 255, 255, 0.04);
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

.markdown-body :deep(hr) {
  height: 2px;
  padding: 0;
  margin: 24px 0;
  background: rgba(0, 0, 0, 0.06);
  border: 0;
}

:global(.dark) .markdown-body :deep(hr) {
  background: rgba(255, 255, 255, 0.06);
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body :deep(li + li) {
  margin-top: 0.25em;
}

.markdown-body :deep(strong) {
  font-weight: 600;
}

.markdown-body :deep(em) {
  font-style: italic;
}

.markdown-body :deep(del) {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>
