<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<script>
export default {

    mounted() {
        // nb. for some reason the current route does not load automatically
        // in the context of a published q-app, so we do that explicitly
        if (window._qdnPath !== undefined) {
            this.$router.push(window._qdnPath)
        }
    },

    methods: {

        openDocs() {
            qortalRequest({
                action: "OPEN_NEW_TAB",
                qortalLink: "qortal://APP/Q-Docs",
            })
        },
    },
}
</script>

<template>
  <header>
    <div style="display: flex; align-items: center;">

      <h1 class="is-size-1"
          style="flex-grow: 1;">
        Q-Apps Dev Sandbox
      </h1>

      <o-button @click="openDocs()"
                variant="primary"
                >
        <!-- icon-left="arrow-right" -->
        Q-Docs (open new tab)
      </o-button>

    </div>

    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/qortalRequest/"><span class="is-family-code">qortalRequest()</span></RouterLink>
      <RouterLink to="/QDN/">QDN</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </header>

  <div style="padding: 2rem;">
    <RouterView />
  </div>
</template>

<style scoped>

header {
    padding: 1rem;
}

nav {
  text-align: left;
  margin-top: 1rem;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

</style>
