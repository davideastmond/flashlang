<script setup lang="ts">
import Navheader from '~/components/navheader.vue';
const { data } = useAuth();
</script>

<template>
  <div>
    <Navheader :display-text="data?.user?.email as string || 'User'" />
    <slot />
  </div>
</template>
