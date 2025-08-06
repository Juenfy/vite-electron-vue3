<script setup lang="ts">
import tvNavbar from './components/layout/tv-navbar.vue'
import tvMain from './components/layout/tv-main.vue'
import tvFooter from './components/layout/tv-footer.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
    <div>
        <tv-navbar />
        <tv-main>
            <router-view :key="route.fullPath"></router-view>
        </tv-main>
        <tv-footer />
    </div>
</template>

<style scoped></style>