export const translations = {
  EN: {
    // JoinGame
    pleaseEnterYourName: 'Please enter your name',
    pleaseEnterGameCode: 'Please enter the game code',
    helloUser: '👋 Hello, {name}!',
    yourAvatarAlt: 'Your avatar',
    changeAvatar: 'Change avatar',
    yourName: 'Your name',
    enterYourName: 'Enter your name',
    joinGameTitle: 'Join game',
    enterGameCodeProvidedByHost: 'Enter the game code provided by the host',
    gameCode: 'Game code',
    enterSixDigitCode: 'Enter 6-digit code',
    whatToExpect: 'What to Expect:',
    waitInLobbyUntilHostStarts: 'Wait in the lobby until the host starts',
    completeSixCheckpoints: 'Complete 6 checkpoints of exciting challenges',
    competeAgainstOtherPlayers: 'Compete against other players',
    earnCoinsAndBuyPowerUps: 'Earn coins and buy power-ups',
    aimForTopOfLeaderboard: 'Aim for the top of the leaderboard!',
    joining: 'Joining...',
    join: 'Join',
    signUpAlt: 'Sign Up',

    // WaitingRoom
    joinedAsPlayer: 'Joined as Player',
    leave: 'Leave',
    waitingHost: 'Waiting host ...',
    waitingHostToStartGame: 'Waiting the host to start the game',
    waitingAlt: 'Waiting...',
    playersCount: 'Players ({count})',
    youSuffix: ' (You)',
    areYouSureLeaveGame: 'Are you sure to leave the game?',
    confirm: 'Confirm',
    cancel: 'Cancel',

    // PlayerGame
    pointAtQrCode: 'Point at QR code',
    scanningPleaseWait: 'Scanning... please wait',
    invalidQrCode: 'Invalid QR code. Please scan the correct checkpoint QR.',
    checkpointAlreadyCompletedTryAnother:
      'Checkpoint {checkpoint} already completed! Try another one.',
    checkpointAlreadyCompletedMoveTo:
      'Checkpoint {checkpoint} already completed! Move to checkpoint {current}.',
    wrongCheckpointNeed:
      'Wrong checkpoint! You need checkpoint {current}.',
    couldNotAccessCamera:
      'Could not access camera. Please allow camera permission.',
    signOut: 'Sign out',
    qrCheckpoint: 'QR checkpoint',
    scanQrToUnlockNextChallenge: 'Scan QR code to unlock the next challenge',
    yourProgress: 'Your progress',
    completedProgress: '{completed}/{total} completed',
    currentCheckpoint: 'Current checkpoint:',
    scanAnyRemainingCheckpointQr: 'Scan any remaining checkpoint QR code',
    readyForFinalChallenge:
      'You have completed {total} checkpoints. Ready to make the final challenge.',
    finalGameAlt: 'Final game',
    playFinalGame: '▶ Play final game',
    cameraQrScanner: 'Camera / QR scanner',
    tapScanQrToStart: 'Tap "Scan QR" to start',
    scanQr: 'Scan QR',
    scanning: 'Scanning...',
    timeLeft: 'Time left',
    life: 'Life',
    coins: 'Coins',
    areYouSureSignOut: 'Are you sure you want to sign out?',
    hostEndedGame: 'Host has ended the game',
    returningHomeIn: 'Returning to home in',

    // SelectGames
    memoryCardGame: 'Memory card game',
    memoryCardGameDesc: 'Match pairs of cards by remembering their position',
    simonGame: 'Simon game',
    simonGameDesc: 'Remember and repeat the pattern as long as possible.',
    puzzleGame: 'Puzzle game',
    puzzleGameDesc: 'Arrange the puzzle pieces to form a meaningful picture',
    whackAMole: 'Whack-a-Mole',
    whackAMoleDesc: 'Hit as many moles as possible in a limited time',
    towerBuilder: 'Tower builder',
    towerBuilderDesc: 'Build as high as possible without the tower falling',
    quizGame: 'Quiz game',
    quizGameDesc: 'Guess the correct word or phrase they represent',
    clickCounterGame: 'Click Counter Game',
    clickCounterGameDesc:
      'Tap as fast as you can and reach the target count before time runs out',
    randomColorClicker: 'Random Color Clicker',
    randomColorClickerDesc:
      'Tap the button that matches the text color, not the written word',
    snakeGame: 'Snake game',
    snakeGameDesc:
      'Collect apples, avoid walls, and survive the fading snake challenge',
    clickToShootTargets: 'Click-to-Shoot Targets',
    clickToShootTargetsDesc:
      'Tap the moving target quickly and clear the hit goal before time runs out',
    mazeGame: 'Maze game',
    mazeGameDesc:
      'Navigate a random maze, avoid roaming enemies on higher difficulties, and find the exit',
    shapeMatcher: 'Shape Matcher',
    shapeMatcherDesc:
      'Spot the target shape and tap the matching option before time runs out',
    crossRoad: 'Cross-road',
    crossRoadDesc:
      'Cross busy traffic lanes on mobile controls and reach the goal at the top',

    failedToGenerateQrCodes: 'Failed to generate QR codes',
    pleaseSelectAtLeastOneGame: 'Please select at least 1 game',
    notLoggedIn: 'Not logged in',
    checkpointLabel: 'Checkpoint {checkpoint}',
    selectGames: 'Select Games',
    chooseGamesAndSetOrder: 'Choose games and set order',
    instructions: 'ℹ️ Instructions',
    tapGamesBelowToSelect: '• Tap games below to select (max {max})',
    dragSelectedListToReorder: '• Drag ≡ in the selected list to reorder checkpoints',
    numberOfCheckpointsEqualsGames: '• Number of checkpoints = number of games selected',
    downloadQrCodesForEachCheckpoint: '• Download QR codes for each checkpoint',
    availableGamesCount: 'Available Games ({count})',
    selectedCheckpoints: '✅ Selected ({count} checkpoint{suffix})',
    checkpointPluralSuffix: 's',
    tapToViewAndReorder: '— tap to view & reorder',
    downloading: 'Downloading...',
    downloadQrCodes: 'Download QR codes',
    creating: 'Creating...',
    createGameWithCheckpoints: 'Create Game ({count} checkpoints) ▶',
    tapGamesAboveToSelect: 'Tap games above to select them',

    // Host / common
loggedOut: 'Logged out',
loggedInAsHost: 'Logged in as Host',
logout: 'Logout',

// HostLogin
pleaseFillAllFields: 'Please fill in all fields',
loginSuccessful: 'Login successful!',
loginAlt: 'Login',
loginTitle: 'Login',
enterUsername: 'Enter username',
enterYourPassword: 'Enter your password',
loggingIn: 'Logging in...',
login: 'Login',
createNewAccount: 'Create new account?',
signUp: 'Sign Up',

// HostSignUp
accountCreated: 'Account created!',
signUpTitle: 'Sign Up',
creatingAccount: 'Creating...',
alreadyHaveAccount: 'Already have an account?',

// HostSetup
pleaseEnterGameName: 'Please enter a game name',
hostGameSetup: 'Host game setup',
configureGameSettings: 'Configure your game settings and get ready to start.',
gameName: 'Game name',
enterGameName: 'Enter game name',
totalGameTime: 'Total game time :',
minutesCount: '{count} minutes',
minutesShortCount: '{count} mins',
gameStructure: 'Game Structure:',
gameStructureQrCheckpoints: '6 QR Checkpoints to discover',
gameStructureMiniGames: '3 Mini games',
gameStructureQuiz: '3 Quiz',
gameStructureFinalGame: '1 Final game',
gameMode: '🗺️ Game Mode',
orderedMode: 'Ordered Mode',
orderedModeDesc: 'Players must complete games sequentially (1→2→3→...)',
randomMode: 'Random Mode',
randomModeDesc: 'Players can complete games in any order',
gameLevel: '🎯 Game Level',
easy: 'Easy',
easyDesc: 'Unlimited lives 🌈 — players never lose progress. Perfect for a fun, stress-free adventure!',
normal: 'Normal',
normalDesc: 'Start with 5 lives 💛 — if all lives are lost, restart from checkpoint 1. Mini-games have lower goals and more forgiving time limits.',
hard: 'Hard',
hardDesc: 'Start with 3 lives 🔥 — if all lives are lost, restart from checkpoint 1. Mini-games are stricter and time moves faster. For the bravest capybaras only!',
nextSelectGames: 'Next: Select Games',

// HostDashboard
waitingRoomTitle: 'Waiting Room',
waitingForPlayersToJoin: 'Waiting for players to join...',
shareCodeWithPlayers: 'Share this code with other players.',
hostLabel: 'Host :',
noPlayersYetShareCode: 'No players yet. Share the code!',
startGame: 'Start game',
exitGame: 'Exit game',
startGameNow: 'Start game now?',
playersJoined: 'Players joined',
gameTime: 'Game time',
starting: 'Starting...',
areYouSureEndGame: 'Are you sure to end game?',

// HostGameInProgress
done: 'Done',
out: 'Out',
inGame: 'In game',
gameInProgress: 'Game in progress',
completed: 'Completed',
liveRanking: 'Live Ranking',
byCheckpoint: 'by checkpoint',
noPlayersYet: 'No players yet.',
endGame: 'End game',
timesUp: "Time's up!",
redirectingToLeaderboardIn: 'Redirecting to leaderboard in',

// ───────── LANDING PAGE ─────────
landingMascotAlt: 'Brown bear mascot',
landingTitle: 'The prophecy of Mystery X',
landingSubtitle: 'Find QR codes. Play games. Win!',

welcomeBackUser: '👋 Welcome back, {name}!',
ongoingGame: 'You have an ongoing game.',

hostGameDesc: 'Create a new game and invite players to join.',
joinGameDesc: 'Enter a game code and join your friends.',

joinGame: 'Join game',
createGame: 'Create game',

howToPlay: 'How to play?',

scanQrCheckpoints: 'Scan QR Checkpoints',
scanQrCheckpointsDesc: 'Find and scan QR codes hidden at different locations.',

completeMiniGames: 'Complete Mini Games',
completeMiniGamesDesc: 'Play mini games at each checkpoint and earn coins.',

shopForPowerUps: 'Shop for Power-ups',
shopForPowerUpsDesc: 'Use your coins to buy time boosts, extra lives, and more.',

finalChallenge: 'Final Challenge',
finalChallengeDesc: 'Complete all checkpoints to unlock the epic final challenge!',

allTimeRanking: 'All Time Ranking',

rank: 'Rank',
name: 'Name',
score: 'Score',


// ───────── LEADERBOARD PAGE ─────────
leaderboardLoading: 'Loading...',


// ───────── LIVE LEADERBOARD ─────────
gameCompleted: 'Game completed',
youFinishedInPlace: 'You finished in #{rank} place',

congratulations: '🎉 Congratulations',
champion: 'Champion! 🎉',

yourRank: 'Your rank',
totalPlayers: 'Total players',
yourScore: 'Your score',

finalLeaderboardLower: 'Final leaderboard',
liveLeaderboardTitle: 'Leaderboard',

// AvatarSelect
chooseYourAvatar: 'Choose your avatar',
pickOrUploadAvatar: 'Pick one or upload your own',
selectedAvatarAlt: 'Selected avatar',
avatarAlt: 'avatar',
uploading: 'Uploading...',
upload: 'Upload',
select: 'Select',
uploadFailed: 'Upload failed: {message}',

// Champion / shared result pages
youDominatedCompetition: 'You dominated the competition!',

// CheckpointScan
notInGame: 'Not in a game',
joinGameBeforeScanning: 'You need to join a game first before scanning checkpoints.',
joinAGame: 'Join a game',
alreadyCompleted: 'Already completed!',
alreadyCompletedRandom: 'You already completed Checkpoint {checkpoint}. Find another QR code to scan.',
alreadyCompletedOrdered: 'You already passed Checkpoint {checkpoint}. Please move to Checkpoint {current}.',
backToGame: 'Back to game',
wrongCheckpoint: 'Wrong checkpoint!',
wrongCheckpointMessage: 'This is Checkpoint {checkpoint}, but you need Checkpoint {current}. Find the right QR code and scan it.',

// GameOver
gameIsEnded: 'Game is ended.',
youAreInPlace: 'You are in #{rank} place',
gameDuration: 'Game duration',
durationHoursMinutes: '{hours}h {minutes}m',
durationMinutes: '{minutes} min',
durationUnavailable: '—',

// FinalShop
shopSellerAlt: 'Shop seller',
spendCoinsForFinalGame: 'Spend your coins on power-ups for the final game!',
yourCoins: 'Your coins',
extraLife: 'Extra Life',
extraLifeDesc: 'Start with one more life.',
livesProgress: 'Lives: {current} / {max}',
buy: 'Buy',
bridgeBuddy: 'Bridge Buddy',
bridgeBuddyDesc: 'Close misses are forgiven — each use saves 1 fall.',
usesProgress: 'Uses: {current} / {max}',

  },

  FI: {
    // JoinGame
    pleaseEnterYourName: 'Anna nimesi',
    pleaseEnterGameCode: 'Anna pelikoodi',
    helloUser: '👋 Hei, {name}!',
    yourAvatarAlt: 'Avatarisi',
    changeAvatar: 'Vaihda avatar',
    yourName: 'Nimesi',
    enterYourName: 'Anna nimesi',
    joinGameTitle: 'Liity peliin',
    enterGameCodeProvidedByHost: 'Anna hostin antama pelikoodi',
    gameCode: 'Pelikoodi',
    enterSixDigitCode: 'Anna 6-numeroinen koodi',
    whatToExpect: 'Mitä odottaa:',
    waitInLobbyUntilHostStarts: 'Odota aulassa, kunnes host käynnistää pelin',
    completeSixCheckpoints: 'Suorita 6 tarkistuspistettä täynnä hauskoja haasteita',
    competeAgainstOtherPlayers: 'Kilpaile muita pelaajia vastaan',
    earnCoinsAndBuyPowerUps: 'Ansaitse kolikoita ja osta tehosteita',
    aimForTopOfLeaderboard: 'Tavoittele tulostaulukon kärkeä!',
    joining: 'Liitytään...',
    join: 'Liity',
    signUpAlt: 'Rekisteröidy',

    // WaitingRoom
    joinedAsPlayer: 'Liitytty pelaajana',
    leave: 'Poistu',
    waitingHost: 'Odotetaan hostia ...',
    waitingHostToStartGame: 'Odotetaan, että host käynnistää pelin',
    waitingAlt: 'Odotetaan...',
    playersCount: 'Pelaajat ({count})',
    youSuffix: ' (Sinä)',
    areYouSureLeaveGame: 'Haluatko varmasti poistua pelistä?',
    confirm: 'Vahvista',
    cancel: 'Peruuta',

    // PlayerGame
    pointAtQrCode: 'Kohdista QR-koodiin',
    scanningPleaseWait: 'Skannataan... odota hetki',
    invalidQrCode: 'Virheellinen QR-koodi. Skannaa oikea tarkistuspisteen QR-koodi.',
    checkpointAlreadyCompletedTryAnother:
      'Tarkistuspiste {checkpoint} on jo suoritettu! Kokeile toista.',
    checkpointAlreadyCompletedMoveTo:
      'Tarkistuspiste {checkpoint} on jo suoritettu! Siirry tarkistuspisteeseen {current}.',
    wrongCheckpointNeed:
      'Väärä tarkistuspiste! Tarvitset tarkistuspisteen {current}.',
    couldNotAccessCamera:
      'Kameraa ei voitu käyttää. Salli kameran käyttöoikeus.',
    signOut: 'Kirjaudu ulos',
    qrCheckpoint: 'QR-tarkistuspiste',
    scanQrToUnlockNextChallenge: 'Skannaa QR-koodi avataksesi seuraavan haasteen',
    yourProgress: 'Edistymisesi',
    completedProgress: '{completed}/{total} suoritettu',
    currentCheckpoint: 'Nykyinen tarkistuspiste:',
    scanAnyRemainingCheckpointQr: 'Skannaa mikä tahansa jäljellä oleva tarkistuspisteen QR-koodi',
    readyForFinalChallenge:
      'Olet suorittanut {total} tarkistuspistettä. Oletko valmis viimeiseen haasteeseen?',
    finalGameAlt: 'Loppupeli',
    playFinalGame: '▶ Pelaa loppupeliä',
    cameraQrScanner: 'Kamera / QR-skanneri',
    tapScanQrToStart: 'Aloita napauttamalla "Skannaa QR"',
    scanQr: 'Skannaa QR',
    scanning: 'Skannataan...',
    timeLeft: 'Aikaa jäljellä',
    life: 'Elämät',
    coins: 'Kolikot',
    areYouSureSignOut: 'Haluatko varmasti kirjautua ulos?',
    hostEndedGame: 'Host on päättänyt pelin',
    returningHomeIn: 'Palataan etusivulle',

    // SelectGames
    memoryCardGame: 'Muistikorttipeli',
    memoryCardGameDesc: 'Yhdistä korttiparit muistamalla niiden sijainti',
    simonGame: 'Simon-peli',
    simonGameDesc: 'Muista ja toista kuvio mahdollisimman pitkään.',
    puzzleGame: 'Palapeli',
    puzzleGameDesc: 'Järjestä palat muodostaaksesi merkityksellisen kuvan',
    whackAMole: 'Whack-a-Mole',
    whackAMoleDesc: 'Lyö mahdollisimman monta myyrää rajatussa ajassa',
    towerBuilder: 'Torninrakennus',
    towerBuilderDesc: 'Rakenna mahdollisimman korkea torni ilman että se kaatuu',
    quizGame: 'Tietovisa',
    quizGameDesc: 'Arvaa oikea sana tai lause, jota ne esittävät',
    clickCounterGame: 'Klikkauslaskuripeli',
    clickCounterGameDesc:
      'Napauta niin nopeasti kuin pystyt ja saavuta tavoitemäärä ennen ajan loppumista',
    randomColorClicker: 'Satunnainen väriklikkaus',
    randomColorClickerDesc:
      'Napauta painiketta, joka vastaa tekstin väriä, ei kirjoitettua sanaa',
    snakeGame: 'Mato-peli',
    snakeGameDesc:
      'Kerää omenoita, vältä seiniä ja selviydy haalistuvan madon haasteesta',
    clickToShootTargets: 'Klikkaa ja ammu maaleja',
    clickToShootTargetsDesc:
      'Napauta liikkuvaa maalia nopeasti ja saavuta osumatavoite ennen ajan loppumista',
    mazeGame: 'Labyrinttipeli',
    mazeGameDesc:
      'Kulje satunnaisen labyrintin läpi, vältä vaikeammilla tasoilla liikkuvia vihollisia ja löydä uloskäynti',
    shapeMatcher: 'Muotojen yhdistäjä',
    shapeMatcherDesc:
      'Etsi kohdemuoto ja napauta vastaavaa vaihtoehtoa ennen ajan loppumista',
    crossRoad: 'Risteys',
    crossRoadDesc:
      'Ylitä vilkkaat liikennekaistat mobiilikontrolleilla ja saavuta tavoite ylhäällä',

    failedToGenerateQrCodes: 'QR-koodien luonti epäonnistui',
    pleaseSelectAtLeastOneGame: 'Valitse vähintään 1 peli',
    notLoggedIn: 'Et ole kirjautunut sisään',
    checkpointLabel: 'Tarkistuspiste {checkpoint}',
    selectGames: 'Valitse pelit',
    chooseGamesAndSetOrder: 'Valitse pelit ja määritä järjestys',
    instructions: 'ℹ️ Ohjeet',
    tapGamesBelowToSelect: '• Valitse alla olevia pelejä napauttamalla (max {max})',
    dragSelectedListToReorder: '• Vedä ≡ valitussa listassa muuttaaksesi tarkistuspisteiden järjestystä',
    numberOfCheckpointsEqualsGames: '• Tarkistuspisteiden määrä = valittujen pelien määrä',
    downloadQrCodesForEachCheckpoint: '• Lataa QR-koodit jokaiselle tarkistuspisteelle',
    availableGamesCount: 'Saatavilla olevat pelit ({count})',
    selectedCheckpoints: '✅ Valittu ({count} tarkistuspiste{suffix})',
    checkpointPluralSuffix: 'ttä',
    tapToViewAndReorder: '— napauta nähdäksesi ja järjestääksesi',
    downloading: 'Ladataan...',
    downloadQrCodes: 'Lataa QR-koodit',
    creating: 'Luodaan...',
    createGameWithCheckpoints: 'Luo peli ({count} tarkistuspistettä) ▶',
    tapGamesAboveToSelect: 'Valitse pelit napauttamalla yllä',

    // Host / common
loggedOut: 'Kirjauduttu ulos',
loggedInAsHost: 'Kirjautunut hostina',
logout: 'Kirjaudu ulos',

// HostLogin
pleaseFillAllFields: 'Täytä kaikki kentät',
loginSuccessful: 'Kirjautuminen onnistui!',
loginAlt: 'Kirjautuminen',
loginTitle: 'Kirjaudu sisään',
enterUsername: 'Anna käyttäjänimi',
enterYourPassword: 'Anna salasana',
loggingIn: 'Kirjaudutaan...',
login: 'Kirjaudu sisään',
createNewAccount: 'Luo uusi tili?',
signUp: 'Rekisteröidy',

// HostSignUp
accountCreated: 'Tili luotu!',
signUpTitle: 'Rekisteröidy',
creatingAccount: 'Luodaan...',
alreadyHaveAccount: 'Onko sinulla jo tili?',

// HostSetup
pleaseEnterGameName: 'Anna pelin nimi',
hostGameSetup: 'Host-pelin asetukset',
configureGameSettings: 'Määritä pelin asetukset ja valmistaudu aloittamaan.',
gameName: 'Pelin nimi',
enterGameName: 'Anna pelin nimi',
totalGameTime: 'Pelin kokonaisaika :',
minutesCount: '{count} minuuttia',
minutesShortCount: '{count} min',
gameStructure: 'Pelin rakenne:',
gameStructureQrCheckpoints: '6 löydettävää QR-tarkistuspistettä',
gameStructureMiniGames: '3 minipeliä',
gameStructureQuiz: '3 tietovisaa',
gameStructureFinalGame: '1 loppupeli',
gameMode: '🗺️ Pelitila',
orderedMode: 'Järjestetty tila',
orderedModeDesc: 'Pelaajien täytyy suorittaa pelit järjestyksessä (1→2→3→...)',
randomMode: 'Satunnainen tila',
randomModeDesc: 'Pelaajat voivat suorittaa pelit missä tahansa järjestyksessä',
gameLevel: '🎯 Pelitaso',
easy: 'Helppo',
easyDesc: 'Rajattomat elämät 🌈 — pelaajat eivät koskaan menetä edistymistään. Täydellinen hauskaan ja stressittömään seikkailuun!',
normal: 'Normaali',
normalDesc: 'Aloita 5 elämällä 💛 — jos kaikki elämät menetetään, aloitetaan tarkistuspisteestä 1. Minipelien tavoitteet ovat helpompia ja aikarajat armollisempia.',
hard: 'Vaikea',
hardDesc: 'Aloita 3 elämällä 🔥 — jos kaikki elämät menetetään, aloitetaan tarkistuspisteestä 1. Minipelit ovat tiukempia ja aika kuluu nopeammin. Vain rohkeimmille kapybaroille!',
nextSelectGames: 'Seuraava: Valitse pelit',

// HostDashboard
waitingRoomTitle: 'Odotushuone',
waitingForPlayersToJoin: 'Odotetaan pelaajien liittymistä...',
shareCodeWithPlayers: 'Jaa tämä koodi muille pelaajille.',
hostLabel: 'Host :',
noPlayersYetShareCode: 'Ei vielä pelaajia. Jaa koodi!',
startGame: 'Aloita peli',
exitGame: 'Poistu pelistä',
startGameNow: 'Aloitetaanko peli nyt?',
playersJoined: 'Liittyneet pelaajat',
gameTime: 'Peliaika',
starting: 'Aloitetaan...',
areYouSureEndGame: 'Haluatko varmasti päättää pelin?',

// HostGameInProgress
done: 'Valmis',
out: 'Ulkona',
inGame: 'Pelissä',
gameInProgress: 'Peli käynnissä',
completed: 'Valmiit',
liveRanking: 'Live-sijoitus',
byCheckpoint: 'tarkistuspisteen mukaan',
noPlayersYet: 'Ei vielä pelaajia.',
endGame: 'Päätä peli',
timesUp: 'Aika loppui!',
redirectingToLeaderboardIn: 'Siirrytään tulostaulukkoon',

// ───────── LANDING PAGE ─────────
landingMascotAlt: 'Ruskea karhu -maskotti',
landingTitle: 'Mystery X:n ennustus',
landingSubtitle: 'Löydä QR-koodit. Pelaa pelejä. Voita!',

welcomeBackUser: '👋 Tervetuloa takaisin, {name}!',
ongoingGame: 'Sinulla on peli kesken.',

hostGameDesc: 'Luo uusi peli ja kutsu pelaajat mukaan.',
joinGameDesc: 'Anna pelikoodi ja liity ystäviesi peliin.',

// FI
joinGame: 'Liity peliin',
createGame: 'Luo peli',

howToPlay: 'Kuinka pelata?',

scanQrCheckpoints: 'Skannaa QR-tarkistuspisteet',
scanQrCheckpointsDesc: 'Etsi ja skannaa eri paikkoihin piilotetut QR-koodit.',

completeMiniGames: 'Suorita minipelit',
completeMiniGamesDesc: 'Pelaa minipelejä jokaisella tarkistuspisteellä ja ansaitse kolikoita.',

shopForPowerUps: 'Osta tehosteita',
shopForPowerUpsDesc: 'Käytä kolikoitasi ostaaksesi lisäaikaa, lisäelämiä ja muuta.',

finalChallenge: 'Viimeinen haaste',
finalChallengeDesc: 'Suorita kaikki tarkistuspisteet avataksesi eeppisen viimeisen haasteen!',

allTimeRanking: 'Kaikkien aikojen ranking',

rank: 'Sija',
name: 'Nimi',
score: 'Pisteet',


// ───────── LEADERBOARD PAGE ─────────
leaderboardLoading: 'Ladataan...',


// ───────── LIVE LEADERBOARD ─────────
gameCompleted: 'Peli suoritettu',
youFinishedInPlace: 'Sijoituit sijalle #{rank}',

congratulations: '🎉 Onneksi olkoon',
champion: 'Mestari! 🎉',

yourRank: 'Sijoituksesi',
totalPlayers: 'Pelaajia yhteensä',
yourScore: 'Pisteesi',

finalLeaderboardLower: 'Lopullinen tulostaulukko',
liveLeaderboardTitle: 'Tulostaulukko',

// AvatarSelect

chooseYourAvatar: 'Valitse avatarisi',
pickOrUploadAvatar: 'Valitse yksi tai lataa oma',
selectedAvatarAlt: 'Valittu avatar',
avatarAlt: 'avatar',
uploading: 'Ladataan...',
upload: 'Lataa',
select: 'Valitse',
uploadFailed: 'Lataus epäonnistui: {message}',

// Champion / shared result pages
youDominatedCompetition: 'Hallitset kilpailua täydellisesti!',

// CheckpointScan
notInGame: 'Et ole pelissä',
joinGameBeforeScanning: 'Sinun täytyy liittyä peliin ennen tarkistuspisteiden skannaamista.',
joinAGame: 'Liity peliin',
alreadyCompleted: 'Jo suoritettu!',
alreadyCompletedRandom: 'Olet jo suorittanut tarkistuspisteen {checkpoint}. Etsi toinen QR-koodi skannattavaksi.',
alreadyCompletedOrdered: 'Olet jo ohittanut tarkistuspisteen {checkpoint}. Siirry tarkistuspisteeseen {current}.',
backToGame: 'Takaisin peliin',
wrongCheckpoint: 'Väärä tarkistuspiste!',
wrongCheckpointMessage: 'Tämä on tarkistuspiste {checkpoint}, mutta tarvitset tarkistuspisteen {current}. Etsi oikea QR-koodi ja skannaa se.',

// GameOver

gameIsEnded: 'Peli on päättynyt.',
youAreInPlace: 'Olet sijalla #{rank}',
gameDuration: 'Pelin kesto',
durationHoursMinutes: '{hours} h {minutes} min',
durationMinutes: '{minutes} min',
durationUnavailable: '—',

// FinalShop

shopSellerAlt: 'Kaupan myyjä',
spendCoinsForFinalGame: 'Käytä kolikkosi loppupelin tehosteisiin!',
yourCoins: 'Kolikkosi',
extraLife: 'Lisäelämä',
extraLifeDesc: 'Aloita yhdellä lisäelämällä.',
livesProgress: 'Elämät: {current} / {max}',
buy: 'Osta',
bridgeBuddy: 'Siltakaveri',
bridgeBuddyDesc: 'Läheltä piti -tilanteet annetaan anteeksi — jokainen käyttö pelastaa yhdeltä putoamiselta.',
usesProgress: 'Käyttökerrat: {current} / {max}',
  },
};

export function translate(template, vars = {}) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  );
}