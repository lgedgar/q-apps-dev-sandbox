<script>
export default {

    props: {
        modelValue: null,
        required: {
            type: Boolean,
            required: false,
        },
        services: {
            type: Array,
            required: true,
        },
    },

    emits: ['update:modelValue'],

    computed: {
        value: {
            get() {
                return this.modelValue
            },
            set(value) {
                this.$emit('update:modelValue', value)
            },
        },
    },
}
</script>

<template>
  <o-select v-model="value">
    <option v-if="!required" :value="null">(any)</option>
    <option v-for="svc in services"
            :key="svc"
            :value="svc">
      {{ svc }}
    </option>
  </o-select>
</template>
