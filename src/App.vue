<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { mapStores } from 'pinia'
import { useQordialAuthStore, AppFeedback } from 'qordial'
import {useAppSettingsStore} from './stores/settings'
</script>

<script>
export default {

    data() {
        return {
            darkMode: false,
        }
    },

    computed: {
        ...mapStores(useQordialAuthStore, useAppSettingsStore),
    },

    mounted() {
        // nb. for some reason the current route does not load automatically
        // in the context of a published q-app, so we do that explicitly
        if (window._qdnPath !== undefined) {
            this.$router.push(window._qdnPath)
        }

        // set dark mode if applicable
        if (window._qdnTheme == 'dark') {
            this.setDarkMode(true)
        }

        if (this.appSettingsStore.alwaysAuthenticate) {
            this.$qordial.authenticate()
        }
    },

    methods: {

        setDarkMode(dark) {
            this.darkMode = dark
            const body = document.querySelector('body')
            body.className = dark ? 'dark' : ''
        },

        async openDocs() {
            await qortalRequest({
                action: "OPEN_NEW_TAB",
                qortalLink: "qortal://APP/Q-Docs",
            })
        },

        async openSandbox() {
            await qortalRequest({
                action: 'OPEN_NEW_TAB',
                qortalLink: 'qortal://APP/Q-Sandbox',
            })
        },

        async onAuthButtonClick() {
            if (!this.qordialAuthStore.address) {
                await this.$qordial.authenticate()
            } else {
                await qortalRequest({
                    action: 'OPEN_PROFILE',
                    name: this.qordialAuthStore.username,
                })
            }
        },
    },
}
</script>

<template>
  <header>
    <div style="display: flex; gap: 1rem; align-items: center;">

      <h1 class="is-size-1"
          style="flex-grow: 1;">
        Q-Apps Dev Sandbox
      </h1>

      <a v-if="!darkMode"
         href="#" @click.prevent="setDarkMode(true)">
        <o-icon icon="moon" size="large" />
      </a>
      <a v-if="darkMode"
         href="#" @click.prevent="setDarkMode(false)">
        <o-icon icon="sun" size="large" />
      </a>

      <o-button @click="openDocs()"
                variant="primary"
                icon-left="external-link-alt">
        Q-Docs
      </o-button>

      <o-button @click="openSandbox()"
                variant="primary"
                icon-left="external-link-alt">
        Q-Sandbox
      </o-button>

      <app-feedback appname="edbob" />

      <o-button :variant="qordialAuthStore.username ? 'primary' : null"
                icon-left="user"
                @click="onAuthButtonClick">
        {{ qordialAuthStore.username || "not authenticated" }}
      </o-button>

    </div>

    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/qortalRequest/"><span class="is-family-code">qortalRequest()</span></RouterLink>
      <RouterLink to="/QDN/">QDN</RouterLink>
      <RouterLink to="/experimental/">Experimental</RouterLink>
      <RouterLink to="/settings">Settings</RouterLink>
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
