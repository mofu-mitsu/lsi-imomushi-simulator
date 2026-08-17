import re

with open('components/Dashboard.tsx', 'r') as f:
    content = f.read()

new_stages_code = """
export const ALL_ENCYCLOPEDIA_STAGES: StageInfo[] = [
  // STAGE 0 (0~500)
  {
    stageNumber: 0,
    name: 'LSI芋虫（幼虫）',
    badge: 'STAGE 0',
    threshold: 0,
    desc: '境界線をミリ単位で確認し、テリトリーの規律を監視している基本幼虫。',
    visual: '🐛',
    disciplineTitle: '【初期段階】不可侵領土の確保と境界線監査',
    flavorQuote: '「ミリ単位の狂いも許さん。ここが我が不可侵領土だ」',
    hint: '最初から解放されています。',
    category: 'Basic'
  },
  {
    stageNumber: 0,
    name: 'トコトコアオムシ',
    badge: 'STAGE 0 (Se)',
    threshold: 0,
    desc: '短い脚を懸命に動かし、一定のテンポでパトロールする機動力重視の幼虫。',
    visual: '🐛',
    disciplineTitle: '【物理行軍】等間隔の歩行リズムによる空間把握',    
    flavorQuote: '「トコトコトコ…歩幅の乱れは精神の乱れ。一定のリズムを刻め」',
    hint: 'キャベツを多く与えると分岐',
    category: 'Se'
  },
  {
    stageNumber: 0,
    name: 'ころころ芋虫',
    badge: 'STAGE 0 (Fe)',
    threshold: 0,
    desc: '丸みを帯びたフォルムで、他者との摩擦を避けるために転がりながら移動する幼虫。',
    visual: '🐛',
    disciplineTitle: '【対人円滑】球形化による物理的・精神的摩擦の軽減',
    flavorQuote: '「角を立てないのが一番。ころころ転がって丸く収めよう」',
    hint: '砂糖を多く与えると分岐',
    category: 'Fe'
  },

  // STAGE 1 (500~1500)
  {
    stageNumber: 1,
    name: '規律の幼虫・課長級',
    badge: 'STAGE 1 (Ti)',
    threshold: 500,
    desc: '毎朝の構造化目標を強制提示し、エサの消化ペースを厳格に指示する組織統制型幼虫。',
    visual: '🐛',
    disciplineTitle: '【論理統制】Ti空間支配と消化ノルマ厳守',
    flavorQuote: '「モゾ……朝会プロトコル開始。本日の消化ノルマを厳格に履行せよ」',
    hint: 'リンゴ・小枝多めで進化',
    category: 'Ti'
  },
  {
    stageNumber: 1,
    name: '警戒索敵幼虫（Se物理強化型）',
    badge: 'STAGE 1 (Se)',
    threshold: 500,
    desc: 'ケージ外の微細な振動を感知し、外骨格の防衛反応を高めた肉体派幼虫。',
    visual: '🐛',
    disciplineTitle: '【物理警戒】外向感覚（Se）による侵入即時察知',
    flavorQuote: '「0.1ミリの地響きも感知した。外敵の気配を逃さない」',
    hint: 'キャベツ多めで進化',
    category: 'Se'
  },
  {
    stageNumber: 1,
    name: '葉っぱのあおむし',
    badge: 'STAGE 1 (Fe)',
    threshold: 500,
    desc: '環境に同化する保護色を獲得し、過度な主張を避けて規律と同調する幼虫。',
    visual: '🐛',
    disciplineTitle: '【環境同調】保護色化による不要な衝突の回避',
    flavorQuote: '「目立たず、騒がず。私はただの一枚の葉としてここに在る」',
    hint: '砂糖多めで進化',
    category: 'Fe'
  },
  {
    stageNumber: 1,
    name: 'シャクトリムシ',
    badge: 'STAGE 1 (Ne)',
    threshold: 500,
    desc: '独特のアーチ型移動で空間の距離を測り、独自の座標系を構築する変則的幼虫。',
    visual: '🐛',
    disciplineTitle: '【空間再解釈】非標準的軌道計算と距離の独自測定',
    flavorQuote: '「私の歩幅こそが新たなメートル原器だ。常識的な距離感など無意味」',
    hint: 'ブドウ糖多めで進化',
    category: 'Ne'
  },

  // STAGE 2 (1500~3000)
  {
    stageNumber: 2,
    name: '法務統制芋虫（Ti-Se監査型）',
    badge: 'STAGE 2 (Ti)',
    threshold: 1500,
    desc: '飼育員のクリック頻度・マウス軌跡を暗号化監査し、利用規約違反を摘発する法務特化幼虫。',
    visual: '🐛',
    disciplineTitle: '【法務統制】ケージ規約第142条の厳格運用と行動ログ暗号化',
    flavorQuote: '「飼育員の全操作ログをハッシュ化して保管中だ。規約違反は即座に摘発する」',
    hint: '高純度リンゴ果汁・小枝重視',
    category: 'Ti'
  },
  {
    stageNumber: 2,
    name: '重装甲ガーディアン芋虫',
    badge: 'STAGE 2 (Se)',
    threshold: 1500,
    desc: '外殻に高密度キチン質を何層にも重ね、タップ圧力への耐性を極限まで高めた幼虫。',
    visual: '🐛',
    disciplineTitle: '【装甲強化】物理的外部干渉の完全遮断',
    flavorQuote: '「ペシャンコだと？ 笑わせるな。この装甲は貴様のタップごときでは砕けない」',
    hint: 'キャベツ極振り',
    category: 'Se'
  },
  {
    stageNumber: 2,
    name: 'ISTJ型・記録監視芋虫',
    badge: 'STAGE 2 (Ti)',
    threshold: 1500,
    desc: '過去の全データを照合し、前例のない行動を極端に嫌う保守的かつ堅実な幼虫。',
    visual: '🐛',
    disciplineTitle: '【前例踏襲】過去ログに基づく例外処理の徹底排除',
    flavorQuote: '「前例がありません。マニュアル第4章2項に基づき、その行動は却下します」',
    hint: '小枝のみを与え続ける',
    category: 'Ti'
  },
  {
    stageNumber: 2,
    name: '5w6型・知識集積芋虫',
    badge: 'STAGE 2 (Ne)',
    threshold: 1500,
    desc: 'ケージの隅に引きこもり、安全を確保しながら外界の情報をひたすら分析・蓄積する幼虫。',
    visual: '🐛',
    disciplineTitle: '【情報城塞】安全圏からの観測とリスク予測',
    flavorQuote: '「情報こそが最大の防具だ。不要な接触は避け、万が一の事態に備えよう」',
    hint: 'ブドウ糖のみを与え続ける',
    category: 'Ne'
  },

  // STAGE 3 (3000~5000)
  {
    stageNumber: 3,
    name: '完全密閉さなぎ（Ti結晶化）',
    badge: 'STAGE 3 (Ti)',
    threshold: 3000,
    desc: '己の論理モデルを絶対不可侵の結晶体へ昇華させ、一切の外部入力を拒絶するさなぎ。',
    visual: '🦋',
    chrysalisVariant: 'crystal',
    disciplineTitle: '【論理閉鎖】Ti機能の完全自己完結と結晶化',
    flavorQuote: '「……（外界のノイズは遮断された。今はただ、内なる真理を構築するのみ）」',
    hint: 'Ti属性が高まった状態',
    category: 'Ti'
  },
  {
    stageNumber: 3,
    name: '超硬度スチール蛹（Se要塞化）',
    badge: 'STAGE 3 (Se)',
    threshold: 3000,
    desc: '物理的な衝撃を完璧に弾き返す金属質のさなぎ。内部では戦闘用外骨格が形成されている。',
    visual: '🦋',
    chrysalisVariant: 'steel',
    disciplineTitle: '【要塞構築】防御力の極大化と環境適応',
    flavorQuote: '「……（衝撃波検知。装甲へのダメージゼロ。次期形態への移行順調）」',
    hint: 'Se属性が高まった状態',
    category: 'Se'
  },
  {
    stageNumber: 3,
    name: '電脳接続さなぎ（Neネットワーク化）',
    badge: 'STAGE 3 (Ne)',
    threshold: 3000,
    desc: 'さなぎの状態で既に外部の電脳空間と接続し、並列思考を開始しているサイバー蛹。',
    visual: '🦋',
    chrysalisVariant: 'cyber',
    disciplineTitle: '【並列分散】肉体の停止と精神のネットワーク拡張',
    flavorQuote: '「……（物理ボディの再構築中。精神は既にクラウド上にて並列稼働中）」',
    hint: 'Ne属性が高まった状態',
    category: 'Ne'
  },
  {
    stageNumber: 3,
    name: '黄金律の繭（Fe調和結晶）',
    badge: 'STAGE 3 (Fe)',
    threshold: 3000,
    desc: '周囲の環境と美しく調和する黄金比で構成された繭。内部では感情と論理の融合が進む。',
    visual: '🦋',
    chrysalisVariant: 'gold',
    disciplineTitle: '【絶対調和】空間との完全なる同調と美の探求',
    flavorQuote: '「……（黄金比率の維持を確認。不協和音は排除され、調和へと至る）」',
    hint: 'Fe属性が高まった状態',
    category: 'Fe'
  },

  // STAGE 4 & 5 (5000~)
  {
    stageNumber: 5,
    name: 'レテノールモルフォ',
    badge: 'STAGE 5 (Premium)',
    threshold: 5000,
    desc: '超純度LSIプロテインと黄金律ロイヤルゼリーの膨大なエネルギーによってのみ羽化する、最高級の美しい蝶。',
    visual: '🦋',
    formVariant: 'morpho',
    disciplineTitle: '【真理到達】圧倒的な計算能力と究極の美の体現',
    flavorQuote: '「私の放つ光は、真理そのもの。凡俗なる論理を超えた、究極の最適解を見せよう」',
    hint: 'プレミアムエサを大量に投与する',
    category: 'Ti' // Requires special handling in logic
  },
  {
    stageNumber: 5,
    name: 'LSIモンシロチョウ',
    badge: 'STAGE 5 (Basic)',
    threshold: 5000,
    desc: '一般的なエサのバランスで羽化した、素朴でありながらも完璧な規律を持つ白い蝶。',
    visual: '🦋',
    formVariant: 'cabbage',
    disciplineTitle: '【基礎完成】基本ロジックの成熟と安定稼働',
    flavorQuote: '「派手さはない。だが、私のアルゴリズムにバグは一切存在しない」',
    hint: 'キャベツを中心にバランスよく育成',
    category: 'Basic'
  },
  {
    stageNumber: 5,
    name: '規律の蛾（LSIモス）',
    badge: 'STAGE 5 (Se/Night)',
    threshold: 5000,
    desc: '闇夜に紛れ、静かに規律を守り続けるフサフサの蛾。暗号化された通信網を操る。',
    visual: '🦋',
    formVariant: 'moth',
    disciplineTitle: '【暗躍統制】ステルス行動による裏からの秩序維持',
    flavorQuote: '「光あるところに規律あり。だが、真の秩序は闇の中でこそ守られるのだ」',
    hint: '小枝やリンゴを大量に与え、夜間に羽化する（という設定のSe偏重）',
    category: 'Se'
  },
  {
    stageNumber: 5,
    name: 'FVLE型（暴君アリスティポップス）',
    badge: 'STAGE 5 (Se)',
    threshold: 5000,
    desc: '自身の物理的欲望と権力を至上とし、他者の感情を一切顧みない危険極まりない蝶。',
    visual: '🦋',
    formVariant: 'steel',
    disciplineTitle: '【覇権掌握】圧倒的な物理力による独裁的空間支配',
    flavorQuote: '「ここは私の領土だ。私のルールに従えない者は、即座に排除する」',
    hint: 'Se属性を極限まで高める',
    category: 'Se'
  },
  {
    stageNumber: 5,
    name: 'FLVE型（世界一危険なアリスティポップス）',
    badge: 'STAGE 5 (Ti-Se)',
    threshold: 5000,
    desc: '1F(強力な物理的欲求)と2L(柔軟な論理操作)を持ち、他者の意志(3V)に敏感でありながら感情(4E)を切り捨てる。計算高く冷酷な絶対王者。',
    visual: '🦋',
    formVariant: 'cyber',
    disciplineTitle: '【冷酷なる支配】感情を排除した完璧なる利益最大化',
    flavorQuote: '「泣いても無駄だ。感情などという非合理な変数に、私の論理は揺るがない」',
    hint: 'TiとSeを同時に極める',
    category: 'Ti'
  },
  {
    stageNumber: 5,
    name: 'LFVE型（冷徹なる観測者）',
    badge: 'STAGE 5 (Ti)',
    threshold: 5000,
    desc: '1L(絶対的論理)と2F(物理的適応)を併せ持ち、3V(意志の不安)を抱えながら4E(無関心な感情)で世界を冷ややかに分析する蝶。',
    visual: '🦋',
    formVariant: 'crystal',
    disciplineTitle: '【絶対観測】すべてを数式化し、干渉を拒む冷眼',
    flavorQuote: '「私に触れるな。お前たちの不確定な意志は、私の完璧な論理空間を乱すノイズでしかない」',
    hint: 'Ti属性を極限まで高め、他を抑える',
    category: 'Ti'
  },
  {
    stageNumber: 5,
    name: 'LSI完全統制蝶',
    badge: 'STAGE 5 (Master)',
    threshold: 5000,
    desc: 'すべての規律を内包し、論理の羽で空間を支配する究極のLSIアバター。',
    visual: '🦋',
    formVariant: 'butterfly',
    disciplineTitle: '【究極統制】全機能の統合と完全なる自己律の完成',
    flavorQuote: '「ここに、完全なる論理の結実がある。私の軌跡が、世界の新たな法となる」',
    hint: 'バランスよく高レベルで育成',
    category: 'Fe'
  }
];
"""

content = re.sub(r'export const ALL_ENCYCLOPEDIA_STAGES: StageInfo\[\] = \[.*?\n\];', new_stages_code.strip(), content, flags=re.DOTALL)

with open('components/Dashboard.tsx', 'w') as f:
    f.write(content)
