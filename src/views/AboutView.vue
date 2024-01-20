<script setup>
import appsettings from '../appsettings'
</script>

<script>
export default {

    data() {
        return {
            appTitle: appsettings.appTitle,
            appVersion: appsettings.appVersion,
            appDependencies: appsettings.appDependencies,
            appRepository: appsettings.appRepository,
            appMaintainer: appsettings.maintainerName,
        }
    },

    methods: {

        async showMaintainer() {
            await qortalRequest({
                action: 'OPEN_PROFILE',
                name: this.appMaintainer,
            })
        },
    },
}
</script>

<template>
  <div class="about">

    <o-field label="App Name" horizontal>
      <span>{{ appTitle }}</span>
    </o-field>

    <o-field label="App Version" horizontal>
      <span>{{ appVersion }}</span>
    </o-field>

    <o-field label="Dependencies" horizontal>
      <ul>
        <li v-for="(ver, pkg, i) in appDependencies"
            :key="pkg">
          {{ pkg }} {{ ver }}
        </li>
      </ul>
    </o-field>

    <o-field label="Maintainer" horizontal>
      <a href="#" @click.prevent="showMaintainer()">
        {{ appMaintainer }}
      </a>
    </o-field>

    <o-field label="Code Repository" horizontal>
      <span>{{ appRepository }}</span>
    </o-field>

  </div>
</template>
