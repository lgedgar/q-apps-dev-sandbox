<script setup>
import QtubeAdmin from '../components/QtubeAdmin.vue'
import QtubeHome from '../components/QtubeHome.vue'
</script>

<script>
export default {

    data() {
        return {
            activeTab: 0,
        }
    },
}
</script>

<template>
  <div>

    <o-tabs v-model="activeTab">

      <o-tab-item :value="0" label="Q-Tube Admin">
        <QtubeAdmin />
      </o-tab-item>

      <o-tab-item :value="1" label="Q-Tube Home">
        <QtubeHome />
      </o-tab-item>

    </o-tabs>
  </div>
</template>
