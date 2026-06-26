<script setup lang="ts">
defineProps<{
  layoutId: string;
  imageCount: number;
}>();

const c = "bg-blue-200";
const c2 = "bg-blue-300";
</script>

<template>
  <div style="height: 48px" class="overflow-hidden rounded-md">
    <!-- 1 image -->
    <template v-if="layoutId === 'center-fit'">
      <div class="flex items-center justify-center h-full">
        <div class="w-1/2 h-3/4 rounded-sm" :class="c"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'fill-page'">
      <div class="h-full rounded-sm" :class="c"></div>
    </template>

    <!-- 2 images -->
    <template v-else-if="layoutId === 'top-bottom'">
      <div class="flex flex-col gap-0.5 h-full">
        <div class="flex-1 rounded-sm" :class="c"></div>
        <div class="flex-1 rounded-sm" :class="c2"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'left-right'">
      <div class="flex gap-0.5 h-full">
        <div class="flex-1 rounded-sm" :class="c"></div>
        <div class="flex-1 rounded-sm" :class="c2"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'big-small'">
      <div class="flex gap-0.5 h-full">
        <div class="flex-[7] rounded-sm" :class="c"></div>
        <div class="flex-[3] rounded-sm" :class="c2"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'top-big-bottom-small'">
      <div class="flex flex-col gap-0.5 h-full">
        <div class="flex-[7] rounded-sm" :class="c"></div>
        <div class="flex-[3] rounded-sm" :class="c2"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'diagonal'">
      <div class="h-full grid grid-cols-2 grid-rows-2 gap-0.5">
        <div class="rounded-sm" :class="c"></div>
        <div></div>
        <div></div>
        <div class="rounded-sm" :class="c2"></div>
      </div>
    </template>

    <!-- 3 images -->
    <template v-else-if="layoutId === 'three-horizontal'">
      <div class="flex gap-0.5 h-full">
        <div class="flex-1 rounded-sm" :class="c"></div>
        <div class="flex-1 rounded-sm" :class="c2"></div>
        <div class="flex-1 rounded-sm" :class="c"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'three-vertical'">
      <div class="flex flex-col gap-0.5 h-full">
        <div class="flex-1 rounded-sm" :class="c"></div>
        <div class="flex-1 rounded-sm" :class="c2"></div>
        <div class="flex-1 rounded-sm" :class="c"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'one-top-two-bottom'">
      <div class="flex flex-col gap-0.5 h-full">
        <div class="flex-[2] rounded-sm" :class="c"></div>
        <div class="flex gap-0.5 flex-1">
          <div class="flex-1 rounded-sm" :class="c2"></div>
          <div class="flex-1 rounded-sm" :class="c"></div>
        </div>
      </div>
    </template>
    <template v-else-if="layoutId === 'two-top-one-bottom'">
      <div class="flex flex-col gap-0.5 h-full">
        <div class="flex gap-0.5 flex-1">
          <div class="flex-1 rounded-sm" :class="c"></div>
          <div class="flex-1 rounded-sm" :class="c2"></div>
        </div>
        <div class="flex-[2] rounded-sm" :class="c"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'one-big-two-small-right'">
      <div class="flex gap-0.5 h-full">
        <div class="flex-[2] rounded-sm" :class="c"></div>
        <div class="flex-1 flex flex-col gap-0.5">
          <div class="flex-1 rounded-sm" :class="c2"></div>
          <div class="flex-1 rounded-sm" :class="c"></div>
        </div>
      </div>
    </template>

    <!-- 4 images -->
    <template v-else-if="layoutId === 'grid-2x2' || layoutId === 'two-top-two-bottom'">
      <div class="grid grid-cols-2 gap-0.5 h-full">
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c2"></div>
        <div class="rounded-sm" :class="c2"></div>
        <div class="rounded-sm" :class="c"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'four-vertical'">
      <div class="flex flex-col gap-0.5 h-full">
        <div class="flex-1 rounded-sm" :class="c"></div>
        <div class="flex-1 rounded-sm" :class="c2"></div>
        <div class="flex-1 rounded-sm" :class="c"></div>
        <div class="flex-1 rounded-sm" :class="c2"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'four-horizontal'">
      <div class="flex gap-0.5 h-full">
        <div class="flex-1 rounded-sm" :class="c"></div>
        <div class="flex-1 rounded-sm" :class="c2"></div>
        <div class="flex-1 rounded-sm" :class="c"></div>
        <div class="flex-1 rounded-sm" :class="c2"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'one-left-three-right'">
      <div class="flex gap-0.5 h-full">
        <div class="flex-[2] rounded-sm" :class="c"></div>
        <div class="flex-1 flex flex-col gap-0.5">
          <div class="flex-1 rounded-sm" :class="c2"></div>
          <div class="flex-1 rounded-sm" :class="c"></div>
          <div class="flex-1 rounded-sm" :class="c2"></div>
        </div>
      </div>
    </template>
    <template v-else-if="layoutId === 'one-top-three-bottom'">
      <div class="flex flex-col gap-0.5 h-full">
        <div class="flex-[2] rounded-sm" :class="c"></div>
        <div class="flex gap-0.5 flex-1">
          <div class="flex-1 rounded-sm" :class="c2"></div>
          <div class="flex-1 rounded-sm" :class="c"></div>
          <div class="flex-1 rounded-sm" :class="c2"></div>
        </div>
      </div>
    </template>
    <template v-else-if="layoutId === 'three-top-one-left'">
      <div class="h-full">
        <div class="flex gap-0.5 h-1/2 mb-0.5">
          <div class="flex-1 rounded-sm" :class="c2"></div>
          <div class="flex-1 rounded-sm" :class="c"></div>
          <div class="flex-1 rounded-sm" :class="c2"></div>
        </div>
        <div class="flex gap-0.5 h-1/2">
          <div class="flex-[2] rounded-sm" :class="c"></div>
          <div class="flex-1 rounded-sm" :class="c2"></div>
        </div>
      </div>
    </template>
    <template v-else-if="layoutId === 'collage'">
      <div class="flex h-full" style="gap: 0">
        <div class="rounded-sm" :class="c" style="flex: 2"></div>
        <div class="flex flex-col flex-1" style="gap: 0">
          <div class="rounded-sm flex-1" :class="c2"></div>
          <div class="rounded-sm flex-1" :class="c"></div>
        </div>
      </div>
    </template>
    <template v-else-if="layoutId === 'surround'">
      <div class="h-full grid grid-cols-3 grid-rows-2 gap-0.5">
        <div class="rounded-sm" :class="c2"></div>
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c2"></div>
        <div class="rounded-sm" :class="c"></div>
        <div></div>
        <div class="rounded-sm" :class="c2"></div>
      </div>
    </template>

    <!-- 6 images -->
    <template v-else-if="layoutId === 'grid-2x3'">
      <div class="grid grid-cols-3 gap-0.5 h-full">
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c2"></div>
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c2"></div>
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c2"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'grid-3x2'">
      <div class="grid grid-cols-2 gap-0.5 h-full">
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c2"></div>
        <div class="rounded-sm" :class="c2"></div>
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c2"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'one-top-five-bottom'">
      <div class="flex flex-col gap-0.5 h-full">
        <div class="flex-[2] rounded-sm" :class="c"></div>
        <div class="flex gap-0.5 flex-1">
          <div class="flex-1 rounded-sm" :class="c2"></div>
          <div class="flex-1 rounded-sm" :class="c"></div>
          <div class="flex-1 rounded-sm" :class="c2"></div>
          <div class="flex-1 rounded-sm" :class="c"></div>
          <div class="flex-1 rounded-sm" :class="c2"></div>
        </div>
      </div>
    </template>

    <!-- 9 images -->
    <template v-else-if="layoutId === 'grid-3x3'">
      <div class="grid grid-cols-3 gap-0.5 h-full">
        <div v-for="i in 9" :key="i" class="rounded-sm" :class="i % 2 ? c : c2"></div>
      </div>
    </template>
    <template v-else-if="layoutId === 'one-big-eight-surround'">
      <div class="h-full grid grid-cols-3 grid-rows-3 gap-0.5">
        <div class="rounded-sm" :class="c2"></div>
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c2"></div>
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c2"></div>
        <div class="rounded-sm" :class="c"></div>
        <div class="rounded-sm" :class="c2"></div>
      </div>
    </template>

    <!-- fallback -->
    <template v-else>
      <div class="h-full rounded-sm bg-gray-200"></div>
    </template>
  </div>
</template>
