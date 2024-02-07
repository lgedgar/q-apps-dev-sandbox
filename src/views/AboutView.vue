<script setup>
import appsettings from '../appsettings'
import {marked} from 'marked'
import {CopyableText} from 'qordial'
</script>

<script>
export default {

    data() {
        return {
            appsettings,
            viewChangelog: false,
        }
    },

    computed: {
        changelogHTML() {
            return marked.parse(this.appsettings.changelog)
        },
    },

    methods: {

        async showMaintainer() {
            await qortalRequest({
                action: 'OPEN_PROFILE',
                name: this.appsettings.maintainerName,
            })
        },
    },
}
</script>

<template>
  <div class="about">

    <o-field label="App Name" horizontal>
      <span>{{ appsettings.appTitle }}</span>
    </o-field>

    <o-field label="App Version" horizontal>
      <span>
        {{ appsettings.appVersion }}
        &mdash;
        <a href="#" @click.prevent="viewChangelog = true">
          view changelog
        </a>
      </span>
    </o-field>

    <o-modal v-model:active="viewChangelog">
      <div class="card">
        <div class="card-content">
          <iframe :srcdoc="changelogHTML"
                  style="width: 100%; min-height: 100vh;">
          </iframe>
        </div>
      </div>
    </o-modal>

    <o-field label="Maintainer" horizontal>
      <a href="#" @click.prevent="showMaintainer()">
        {{ appsettings.maintainerName }}
      </a>
    </o-field>

    <o-field label="Code Repo" horizontal>
      <CopyableText :text="appsettings.appRepository" />
    </o-field>

    <o-field label="Dependencies" horizontal>
      <ul>
        <li v-for="(ver, pkg, i) in appsettings.appDependencies"
            :key="pkg">
          {{ pkg }} {{ ver }}
        </li>
      </ul>
    </o-field>

  </div>
</template>
