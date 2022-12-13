import * as echarts from '../../ec-canvas/echarts.js'

const app = getApp();

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  var option = {
    backgroundColor: "#ffffff",
    xAxis: {
      show: false
    },
    yAxis: {
      show: false
    },
    radar: {
      // shape: 'circle',
      name: {
        textStyle: {
          fontSize: 10,
          padding: [-15, -15]
        }
      },
      indicator: [{
        name: '攻击',
        max: 500
      },
      {
        name: '防守',
        max: 500
      },
      {
        name: '速度',
        max: 500
      },
      {
        name: '韧性',
        max: 500
      },
      {
        name: '计谋',
        max: 500
      },
      {
        name: '道德',
        max: 500
      }
      ]
    },
    series: [{
      name: '预算 vs 开销',
      type: 'radar',
      data: [{
        value: [430, 340, 500, 300, 490, 400],
        name: '预算'
      }
      ]
    }]
  };

  chart.setOption(option);
  return chart;
}


Component({

  properties: {
    personalCard: {
      type: Object
    }
  },

  data: {
    ec: {
      onInit: initChart
    }
  },

  methods: {

  }
})
