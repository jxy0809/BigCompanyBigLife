import { GameEvent, GameStats } from './types';

// Default start, attributes will be overwritten by CharacterCreation
export const INITIAL_STATS: GameStats = {
  stamina: 100,
  sanity: 100,
  money: 2000,
  level: 1, 
  exp: 0,
  days: 1,
  risk: 0,
  attributes: { grind: 5, eq: 5, tech: 5, health: 5, luck: 5 }
};

export const EVENTS: GameEvent[] = [
  {
    id: 'e1',
    title: '红包雨',
    description: '老板在全员群发了一个随机金额红包，并@所有人“辛苦了”。',
    options: [
      {
        label: '拼手速抢红包',
        effect: (stats) => {
          // Luck determines outcome
          const luckBonus = stats.attributes.luck * 5; 
          const amount = Math.floor(Math.random() * 10) + luckBonus > 40 ? 200 : 0.01;
          const msg = amount > 100 ? `你运气爆棚（灵气 ${stats.attributes.luck}），抢到了运气王！` : '你抢到了0.01元，感觉像个小丑。';
          return { stamina: -2, sanity: amount > 100 ? 5 : -5, money: amount, message: msg };
        }
      },
      {
        label: '装没看见',
        effect: () => ({ stamina: 0, sanity: 5, risk: 2, message: '你保持了高冷，但总觉得HR在后台看数据。' })
      }
    ]
  },
  {
    id: 'e2',
    title: '周五突袭',
    description: '周五下午 17:55，产品经理走过来：“简单对齐一下这个需求，很快的。”',
    options: [
      {
        label: '“好的，马上来”',
        effect: (stats) => {
          // Tech reduces stamina cost
          const techSave = stats.attributes.tech * 1.5;
          const cost = Math.max(5, 25 - techSave);
          return { 
            stamina: -cost, 
            sanity: -10, 
            exp: 10, 
            message: stats.attributes.tech > 10 
              ? `凭借高超的技术（智商 ${stats.attributes.tech}），你一小时就搞定了。` 
              : '“很快”意味着你干到了凌晨两点。' 
          };
        }
      },
      {
        label: '高情商推脱',
        requires: (stats) => stats.attributes.eq >= 8, // Need EQ > 8 to see this
        effect: () => ({ stamina: 0, sanity: 5, risk: 0, message: '你用巧妙的话术（情商>8）让PM觉得这事下周做更好。' })
      },
      {
        label: '尿遁溜走',
        effect: () => ({ stamina: 5, sanity: 10, risk: 10, message: '你成功逃脱，但PM的眼神像是在看死人。' })
      }
    ]
  },
  {
    id: 'e_crit',
    title: '领导的“建议”',
    description: 'P9 大佬在周会上公开点名批评你的项目进度：“我感觉你没有思考清楚底层逻辑。”',
    options: [
      {
        label: '滑跪认错',
        effect: () => ({ sanity: -15, risk: -2, message: '你不停道歉，像个犯错的小学生。' })
      },
      {
        label: '赋能型回复 (需要情商 12)',
        requires: (stats) => stats.attributes.eq >= 12,
        effect: () => ({ 
          sanity: 5, 
          risk: -5, 
          exp: 20,
          message: '你用一套“抓手/闭环/心智”的黑话把P9绕晕了，他觉得你很有潜力。' 
        })
      },
      {
        label: '硬刚',
        effect: () => ({ sanity: 10, risk: 20, message: '你爽了，但你的职业生涯可能要结束了。' })
      }
    ]
  },
  {
    id: 'e3',
    title: '日报周报月报',
    description: '由于团队产出不透明，领导要求开始写“小时报”。',
    options: [
      {
        label: '用脚本自动生成',
        requires: (stats) => stats.attributes.tech >= 8,
        effect: () => ({ stamina: 0, sanity: 5, exp: 5, message: '你写了个脚本（智商>8）自动应付，效率翻倍。' })
      },
      {
        label: '用 AI 生成废话',
        effect: () => ({ stamina: -5, sanity: 5, exp: 2, message: '你掌握了职场核心科技：赋能、抓手、颗粒度。' })
      },
      {
        label: '认真回顾工作',
        effect: () => ({ stamina: -15, sanity: -15, exp: 5, message: '你发现自己一天其实什么都没干，全是废会。' })
      }
    ]
  },
  {
    id: 'e6',
    title: '这锅谁背',
    description: '线上出了 P0 级事故，回滚后发现是前任同事留下的坑。',
    options: [
      {
        label: '据理力争',
        effect: (stats) => {
           const success = stats.attributes.eq > 10;
           return success ? 
             { stamina: -5, sanity: 5, risk: 0, message: '你据理力争（情商>10），成功把锅甩了出去。' } :
             { stamina: -10, sanity: -10, risk: 5, message: '你试图解释，但领导觉得你在推卸责任。' };
        }
      },
      {
        label: '立正挨打',
        effect: () => ({ stamina: -10, sanity: -20, exp: 20, message: '态度诚恳，领导觉得你“有担当”。心智大损。' })
      }
    ]
  },
  {
    id: 'e10',
    title: '工位调整',
    description: '行政通知要调整工位，你的新位置正对着总监办公室的玻璃门。',
    options: [
      {
        label: '极度专注 (需要耐艹 10)',
        requires: (stats) => stats.attributes.grind >= 10,
        effect: () => ({ stamina: -10, exp: 20, message: '你心理素质极强（耐艹>10），完全无视了背后的视线。' })
      },
      {
        label: '买个防窥膜',
        effect: (s) => s.money >= 50 ? 
          { money: -50, sanity: -5, message: '物理防御+1，但心理压力+100。' } : 
          { sanity: -15, risk: 5, message: '没钱买膜，摸鱼变得极其困难。' }
      }
    ]
  },
  {
    id: 'e19',
    title: '代码重构',
    description: '你看着三年前的代码，仿佛在看一座摇摇欲坠的屎山。',
    options: [
      {
        label: '只改当前 Bug',
        effect: () => ({ stamina: -5, sanity: -5, exp: 2, message: '又加了一坨，屎山更高了。' })
      },
      {
        label: '彻底重构 (需要技术 12)',
        requires: (stats) => stats.attributes.tech >= 12,
        effect: () => ({ stamina: -20, sanity: 10, exp: 50, message: '你大刀阔斧重构了模块（技术>12），代码变得赏心悦目。' })
      },
      {
        label: '尝试重构但失败',
        requires: (stats) => stats.attributes.tech < 12,
        effect: () => ({ stamina: -40, sanity: -20, exp: 30, message: '由于技术不够，重构引发了线上 P0，被回滚了。' })
      }
    ]
  },
  {
    id: 'e20',
    title: '神秘的期权',
    description: 'HR 找你谈话，说鉴于你表现优异，授予你 1000 股期权。',
    options: [
      {
        label: '感恩戴德',
        effect: () => ({ sanity: 10, stamina: 10, risk: -5, message: '你感觉自己成了公司的主人（虽然还没上市）。' })
      },
      {
        label: '内心呵呵',
        effect: () => ({ sanity: 5, message: '你清楚这玩意儿可能比废纸还便宜。' })
      }
    ]
  },
   {
    id: 'e_gym',
    title: '健身卡推销',
    description: '楼下健身房跑路了，但你上周刚续了 3000 块私教课。',
    options: [
      {
        label: '暴力维权 (体质 > 15)',
        requires: (stats) => stats.attributes.health > 15,
        effect: () => ({ stamina: -10, sanity: 10, money: 1500, message: '你凭借魁梧的身材（体质>15）吓退了老板，追回了一半学费。' })
      },
      {
        label: '认栽',
        effect: () => ({ sanity: -10, message: '就当破财免灾，反正也没空去。' })
      }
    ]
  },
];