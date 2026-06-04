export enum EnemyType {

    //basic enemy types
    Basic,
    Fast,
    Tanky,
    Chaser,
    MiniChaser,
    TrapperChaser,
    Ball,

    //minibosses
    SentryMiniboss,
    TeleportingMiniboss,
    SpawnerMiniboss,
    

    //bosses
    SentryBoss,
    TeleportingBoss,
    SpawnerBoss,

    //test/debug
    TestDummy,

}
//levels: 
//      campaigns: waves of enemies, possible unique mechanics, boss at end of level, possible miniboss that uses nerfed attacsk from boss as a wave, set max and starting hp for player
//      boss: fight boss of campaign level, same unique mechanic as campaign, no waves just boss fight, 1 hp
//      tutorial: teaches player mechanics
export enum Level {
    Tutorial,
    CampaignLevel1,
    BossLevel1,
    CampaignLevel2,
    BossLevel2,
    CampaignLevel3,
    BossLevel3,

}


export enum PlayerCharacter {
    Archer,
    Sentinel,
    Mage,
    Swordsman,
}