<script setup>
import VCodeBlock from '@wdns/vue-code-block'

defineProps({
    action: {
        type: Object,
        required: true,
    },
})
</script>

<script>
export default {

    data() {

        let testParams = {}
        for (var param of this.action.params) {
            if (param.default) {
                testParams[param.name] = param.default
            }
        }

        return {
            callMade: false,
            callResult: null,
            testParams: testParams,
        }
    },

    watch: {
        // TODO: without this the call results from previous call remain
        // displayed when switching to new action view..but seems like
        // this should be automatically handled..?
        action (to, from) {
            this.callMade = false
        }
    },

    computed: {

        generatedCode() {
            let code = "const response = await qortalRequest({\n"
                + "  action: \"" + this.action.action + "\",\n"
            for (var param of this.action.params) {
                let value = this.testParams[param.name]
                if (value === undefined) {
                    value = 'null'
                } else if (param.type === String) {
                    value = '"' + value + '"'
                }
                code += "  " + param.name + ": " + value + ",\n"
            }
            code += "});"
            return code
        },
    },

    methods: {

        getFieldVariant(param) {

            if (param.required) {
                if (!this.testParams[param.name]) {
                    return 'danger'
                }
            }

            return null
        },

        invokeCode: async function() {
            this.callResult = null

            let params = {
                ...this.testParams,
                action: this.action.action,
            }

            for (var param of this.action.params) {
                if (params[param.name] === undefined) {
                    if (params.required) {
                        params[param.name] = ""
                    }
                }
            }

            try {
                let response = await qortalRequest(params)
                this.callResult = JSON.stringify(response, null, 2)
                this.callMade = true

            } catch (error) {
                // console.log(error)
                if (error.error) {
                    this.callResult = JSON.stringify(error, null, 2)
                } else {
                    this.callResult = error.toString()
                }
                this.callMade = true
            }
        },

        resetForm() {
            this.callMade = false
        },
    },
}
</script>

<template>
  <div>

    <div style="width: 50%;">

      <o-field v-for="param in action.params"
               :key="param.name"
               :label="param.name"
               :variant="getFieldVariant(param)">

        <o-checkbox v-if="param.type === Boolean"
                    v-model="testParams[param.name]"
                    @input="resetForm()" />

        <o-input v-else
                 v-model="testParams[param.name]"
                 @input="resetForm()" />

      </o-field>

      <p v-if="!action.params.length"
         class="block">
        Does not require any other params.
      </p>

      <div class="block">
        <VCodeBlock :code="generatedCode"
                    highlightjs />
      </div>

      <div v-show="!callMade" class="block">
        <o-button variant="primary"
                  @click="invokeCode()">
          Make the call
        </o-button>
      </div>

    </div>

    <div v-show="callMade" class="block">

      <div class="block">
        <o-button variant="primary"
                  @click="resetForm()">
          Reset
        </o-button>
      </div>

      <o-field label="Response">
        <VCodeBlock :code="callResult"
                    highlightjs />
      </o-field>
    </div>

  </div>
</template>
