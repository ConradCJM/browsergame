export enum EnemyType {

    //basic enemy types
    Basic,
    Fast,
    Tanky,

    //bosses
    SentryBoss,

}
//levels: 
//      campaigns: waves of enemies, possible unique mechanics, boss at end of level, possible miniboss that uses nerfed attacsk from boss as a wave, set max and starting hp for player
//      boss: fight boss of campaign level, same unique mechanic as campaign, no waves just boss fight, 1 hp
//      tutorial: teaches player mechanics, tutorial waves, tutorial boss, set max and starting hp for player
export enum Level{
    Tutorial,
    CampaignLevel1,
    BossLevel1,

}