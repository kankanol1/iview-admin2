<style>
  .ivu-drawer-mask, .ivu-drawer-wrap {
    z-index: 999999 !important;
  }
</style>

<template>
  <Drawer title="关联信息" :closable="false" v-model="showDrawer" :width="600" :zIndex="999999">
    <div style="height: 100%; overflow-y: auto;">
      <table style="border-collapse: collapse;">
        <tr style="border-bottom: 1px solid rgba(0, 0, 0, 1);">
          <td><h3>卡口信息:</h3></td>
          <td><h3>热点信息:</h3></td>
        </tr>
        <template v-for="(item, index) in data">
          <tr style="border-bottom: 1px solid rgba(0, 0, 0, 1);">
            <td width="300px" valign="top" style="border: none;">
              <template v-for="(kitem, kindex) in item.k">
                <p :key="`p1_${kindex}`">路口名称: {{kitem.roadName}}</p>
                <p :key="`p2_${kindex}`">设备编号: {{kitem.machineCode}}</p>
                <p :key="`p3_${kindex}`">点位编号: {{kitem.pointCode}}</p>
                <p :key="`p4_${kindex}`">对应经度: {{kitem.wgsLongitude}}</p>
                <p :key="`p5_${kindex}`">对应纬度: {{kitem.wgsLatitude}}</p>
                <p :key="`p6_${kindex}`">最后更新时间: {{kitem.lastUpdateTime}}</p>
                <hr v-if="kindex != item.k.length - 1" :key="`hr_${kindex}`"/>
              </template>
            </td>
            <td width="300px" valign="top" style="border: none;">
              <template v-for="(ritem, rindex) in item.r">
                <p :key="`p1_${rindex}`">路口名称: {{ritem.roadName}}</p>
                <p :key="`p2_${rindex}`">设备编号: {{ritem.machineCode}}</p>
                <p :key="`p3_${rindex}`">点位编号: {{ritem.pointCode}}</p>
                <p :key="`p4_${rindex}`">对应经度: {{ritem.wgsLongitude}}</p>
                <p :key="`p5_${rindex}`">对应纬度: {{ritem.wgsLatitude}}</p>
                <p :key="`p6_${rindex}`">最后更新时间: {{ritem.lastUpdateTime}}</p>
                <hr v-if="rindex != item.r.length - 1" :key="`hr_${rindex}`"/>
              </template>
            </td>
          </tr>
        </template>
      </table>
    </div>
  </Drawer>
</template>
<script>
export default {
  props: {
    options: {
      type: Object,
      default: () => ({ kakouXhs: [], redianXhs: [], correlations: [/* [[卡口点位,卡口点位], [热点点位,热点点位]],... */], _t: new Date().getTime() })
    },
    height:{
      type: Number,
      default: 0,
    }
  },
  watch: {
    options (val) {
      this.$set(this, 'data', []); // 清空历史记录
      (!val.correlations) && (val.correlations = []);
      (val.kakouXhs && val.kakouXhs.length && val.redianXhs && val.redianXhs.length) && (val.correlations.push([val.kakouXhs || [], val.redianXhs || []]))
      if (val.correlations && val.correlations.length) {
        val.correlations.forEach(__ => {
          if (__ && __.length === 2 && __[0] && __[0].length && __[1] && __[1].length) {
            this.$http.all([
              this.$http.post('/api/com/kakou/selectNodesByPointCode', { pointCodes: __[0].join(',') }), /* 卡口点位 */
              this.$http.post('/api/com/redian/selectNodesByPointCode', { pointCodes: __[1].join(',') }) /* 热点点位 */
            ]).then((responses) => {
              if (responses && responses.length) {
                let [k, r] = [responses[0], responses[1]]
                let peer = {
                  k: k && k.status === 200 && (k.data.status & 0b00001111) === 1 && k.data.data,
                  r: r && r.status === 200 && (r.data.status & 0b00001111) === 1 && r.data.data
                }
                this.data.push(peer)
                this.$set(this, 'showDrawer', true)
              }
            })
          }
        })
      }
    }
  },
  data () {
    return {
      showDrawer: false,
      data: []
    }
  },
  mounted () {
  },
  methods: {}
}
</script>
