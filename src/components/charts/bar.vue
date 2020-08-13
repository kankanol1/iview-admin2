<template>
  <div ref="dom" class="charts chart-bar"></div>
</template>

<script>
import echarts from 'echarts'
import tdTheme from './theme.json'
import { on, off } from '@/libs/tools'

echarts.registerTheme('tdTheme', tdTheme)
export default {
  name: 'ChartBar',
  props: {
    value: Object,
    text: String,
    subtext: String
  },
  data () {
    return {
      dom: null,
      colors: ['#f10606', '#0d39ec', '#2bf106', '#d781c9']
    }
  },
  methods: {
    resize () {
      this.dom.resize()
    }
  },
  mounted () {
    this.$nextTick(() => {
      let xAxisData = Object.keys(this.value)
      let seriesData = Object.values(this.value)
      let option = {
        title: {
          text: this.text,
          subtext: this.subtext,
          x: 'center'
        },
        xAxis: { type: 'category', data: xAxisData },
        tooltip: {
          trigger: 'item'
          // formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: seriesData,
            type: 'bar',
            name: '统计',
            color: [this.colors[Math.floor(Math.random() * this.colors.length)]]
          },
          {
            data: seriesData,
            type: 'line',
            name: '统计',
            color: [this.colors[Math.floor(Math.random() * this.colors.length)]]
          }
        ]
      }
      this.dom = echarts.init(this.$refs.dom, 'tdTheme')
      this.dom.setOption(option)
      on(window, 'resize', this.resize)
    })
  },
  beforeDestroy () {
    off(window, 'resize', this.resize)
  }
}
</script>
