export type IPersonalCard = {
  name: string,
  avatarUrl: string,
  level: string,
  levelUrl: string,
  battleData: {
    winningPerc: number,
  },
  capability: {}
}

let _personalCard: IPersonalCard = {
  name:'Philip大魔王',
  avatarUrl: 'https://c-ssl.dtstatic.com/uploads/blog/202105/11/20210511193549_08e64.thumb.1000_0.jpg',
  level: '快乐韭菜',
  levelUrl: 'https://game.gtimg.cn/images/lol/act/a20171025season/silver-crest.jpg',
  battleData: {
    winningPerc: 0.864
  },
  capability: {}
}

export {
  _personalCard
}