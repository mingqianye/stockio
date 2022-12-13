export type PersonalCard = {
  name: string,
  avatarUrl: string,
  level: string,
  levelUrl: string,
  battleData: {
    winningPerc: string,
  },
  capability: {}
}

export type Player = {
  name: string,
  avatarUrl: string,
  level: string,
  levelUrl: string,
  roomRole: string,
}
 

let _personalCard: PersonalCard = {
  name:'Philip大魔王',
  avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
  level: '快乐韭菜',
  levelUrl: '../../resources/images/public/bronze.png',
  battleData: {
    winningPerc: "86.4%"
  },
  capability: {}
}

let _playerList: Array<Player> = [
  {
    name:'Philip大魔王',
    avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
    level: '快乐韭菜',
    levelUrl: '../../resources/images/public/bronze.png',
    roomRole: 'master'
  }, {
    name:'mq',
    avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
    level: '快乐韭菜',
    levelUrl: '../../resources/images/public/bronze.png',
    roomRole: 'member'
  }, {
    name:'施兄',
    avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
    level: '交易学徒',
    levelUrl: '../../resources/images/public/silver.png',
    roomRole: 'member'
  }, {
    name:'华D',
    avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
    level: '躺平青年',
    levelUrl: '../../resources/images/public/bronze.png',
    roomRole: 'member'
  }, {
    name:'施兄',
    avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
    level: '交易学徒',
    levelUrl: '../../resources/images/public/silver.png',
    roomRole: 'member'
  }, {
    name:'施兄',
    avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
    level: '交易学徒',
    levelUrl: '../../resources/images/public/silver.png',
    roomRole: 'member'
  }, {
    name:'施兄',
    avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
    level: '快乐韭菜',
    levelUrl: '../../resources/images/public/silver.png',
    roomRole: 'member'
  }, {
    name:'施兄',
    avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
    level: '快乐韭菜',
    levelUrl: '../../resources/images/public/silver.png',
    roomRole: 'member'
  }
]

let _teamPlayerList: Array<Player> = [
  {
    name:'Philip大魔王',
    avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
    level: '快乐韭菜',
    levelUrl: '../../resources/images/public/bronze.png',
    roomRole: 'master'
  }, {
    name:'mq',
    avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
    level: '快乐韭菜',
    levelUrl: '../../resources/images/public/bronze.png',
    roomRole: 'member'
  }, {}
  // {
  //   name:'施兄',
  //   avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
  //   level: '快乐韭菜',
  //   levelUrl: '../../resources/images/public/silver.png',
  //   roomRole: 'member'
  // }
]

export {
  _personalCard,
  _playerList,
  _teamPlayerList,
}