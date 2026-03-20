<script setup>
import { ref, computed, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  src: { type: String, required: true },
  height: { type: [String, Number], default: 500 },
})

const { isDark } = useData()

const iframeSrc = computed(() => {
  const base = props.src
  const sep = base.includes('?') ? '&' : '?'
  return isDark.value ? `${base}${sep}theme=dark` : base
})

const iframeRef = ref(null)

// When dark mode changes, reload the iframe to apply the theme
watch(isDark, () => {
  if (iframeRef.value) {
    iframeRef.value.src = iframeSrc.value
  }
})
</script>

<template>
  <div class="component-demo">
    <iframe
      ref="iframeRef"
      :src="iframeSrc"
      :style="{ height: height + 'px' }"
      class="component-demo__frame"
      loading="lazy"
    />
    <div class="component-demo__toolbar">
      <a :href="src" target="_blank">Open standalone</a>
    </div>
  </div>
</template>
