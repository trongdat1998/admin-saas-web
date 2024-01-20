// 极验深知
<template lang="pug">
  div
</template>
<script>
import initSense from '@/libs/sense.js'
import { senseId } from '@/libs/consts.js'
export default {
  props: {
    type: {
      type: Number,
      default: 0,
      required: false,
    },
  },
  data() {
    return {
      senseId,
      senseInstance: null,
    }
  },
  methods: {
    // 执行验证
    sense() {
      const _this = this
      this.senseInstance &&
        this.senseInstance.getSid(
          (res) => {
            _this.$emit('success', res)
          },
          (err) => {
            _this.$emit('error', err)
          }
        )
    },
    execute() {
      this.sense()
    },
    // 重置验证
    reset() {
      this.senseInstance && this.senseInstance.reset()
    },
  },
  mounted() {
    const _this = this
    initSense(
      {
        id: this.senseId,
      },
      (sense) => {
        debugger
        // 配置类型,默认3
        sense.setInfos(() => {
          return {
            interactive: _this.type,
          }
        })
        _this.senseInstance = sense
      }
    )
  },
}
</script>
