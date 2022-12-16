
Component({

  properties: {
    personalCard: Object,
    teamPlayerList: Array,
  },

  data: {
    cardStatus: 'personal',
  },

  methods: {
    // 箭头按钮
    onSlideArrawBtnClicked: function() { this.setData({ cardStatus: this.data.cardStatus == 'personal' ? 'team' : 'personal' }) },

  }
})
