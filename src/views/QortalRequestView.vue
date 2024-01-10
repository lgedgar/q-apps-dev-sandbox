<script setup>
import QortalRequestForm from '../components/QortalRequestForm.vue'
</script>

<script>
export default {
    data() {

        const actions = {

            GET_USER_ACCOUNT: {
                description: "Fetch the address and public key for the current user account.",
                requiresUserApproval: true,
                params: [],
            },

            GET_ACCOUNT_DATA: {
                description: "Return general account information for the given address.",
                params: [
                    {
                        name: 'address',
                        type: String,
                        required: true,
                    },
                ],
            },
        }

        // TODO: need to sort this?
        let actionsList = []
        for (var key in actions) {
            actions[key].action = key
            actionsList.push(actions[key])
        }

        let action = null
        if (this.$route.params.action) {
            action = actions[this.$route.params.action]
        }

        return {
            actions: actions,
            actionsList: actionsList,
            action: action,
            jumpToAction: this.$route.params.action || "null",
        }
    },

    watch: {

        '$route' (to, from) {
            if (to.params.action) {
                this.action = this.actions[to.params.action]
            } else {
                this.action = null
            }
        },
    },

    methods: {

        actionChanged() {
            this.$nextTick(() => {
                const newAction = this.jumpToAction == 'null' ? '' : this.jumpToAction
                this.$router.push(`/qortalRequest/${newAction}`)
            })
        },
    },
}
</script>

<template>
  <main>
    <div class="block"
         style="display: flex; align-items: center; gap: 10rem;">

      <h2 class="is-size-2 is-family-code">qortalRequest()</h2>

      <o-field label="see action" horizontal
               style="white-space: nowrap;">
        <o-select v-model="jumpToAction" @change="actionChanged">
          <option value="null"></option>
          <option v-for="a in actionsList"
                  :key="a.action"
                  :value="a.action">
            {{ a.action }}
          </option>
        </o-select>
      </o-field>

    </div>

    <div v-if="!action" class="block">
      <p class="block">Please choose an action to see more info.</p>
    </div>

    <div v-if="action" class="block">

      <h3 class="is-size-3 is-family-code block">{{ action.action }}</h3>

      <p class="block">
        {{ action.description }}
      </p>

      <o-notification v-if="action.requiresUserApproval"
                      variant="info">
        This action requires user approval.
      </o-notification>

      <div class="block">
        <QortalRequestForm :action="action" />
      </div>

    </div>

  </main>
</template>
