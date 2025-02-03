"use strict";
const IS_DEBUG = !1;
$(document).ready(function() {
    const $wrapper = $("#wrapper");
    const $statsStatusBar = $(`<span class="stats-bar">Stats:</span>`);
    const $notificationBar = $("#notification-bar");
    const $tradeWindow = $(`<span class="floating-window trade-window" id="trade-window" style="display: none;"></span>`);
    const $menuWindow = $(`<span class="floating-window menu-window" id="menu-window" style="display: none;"></span>`);
    const $inventoryWindow = $(`<span class="floating-window inventory-window" id="inventory-window" style="display: none;"></span>`);
    const $faucetWindow = $(`<span class="floating-window faucet-window" id="faucet-window" style="display: none;"></span>`);
    let currentIncome = 0;
    let balance = 0;
    let gameOver = !1;
    let currencies = {
        "BCH": [0, 0, 1 / 24.38812035],
        "ETH": [0, 0, 1 / 29.01215638],
        "LTC": [0, 0, 1 / 67.74590408],
        "XRP": [0, 0, 1 / 13259.08247149],
    };
    let gameStartTime;
    let outBuffer = [];
    const minWait = 150;
    const perCharWait = 2;
    const $input_line = $(`<span class="console-text input-text" id="input-text"></span>`);
    const $input_caret = $(`<span class="caret-text"></span>`);
    const $input = $(`<input id="input" maxlength="30" autocomplete="off">`);
    let textTypes = {
        error: 0,
        warning: 0,
        info: 0,
        "input-text": 0,
    };
    toEnum(textTypes);
    let events = {
        "input-received": 0,
        "inventory-updated": 0,
    };
    toEnum(events);
    let windowToggleAnimationTime = 250;
    class HandleUserInput {
        static me = null;
        constructor() {
            if (this.me) {
                return me
            }
            this.me = this;
            $(document).on(events["input-received"], function(e, val) {
                handleUserInput.input(val)
            })
        }
        inputListeners = [];
        register = function(fn) {
            if (this.inputListeners.includes(fn)) {
                return
            }
            this.inputListeners.push(fn);
            fn.lastInput = null
        }
        unregister = function(fn) {
            let i = this.inputListeners.indexOf(fn);
            if (i > -1) {
                this.inputListeners.splice(i, 1);
                fn.lastInput = null
            }
        }
        unregisterAll = function() {
            this.inputListeners = []
        }
        input = function(val) {
            this.inputListeners.forEach(fn => {
                fn.lastInput = val
            }
            )
        }
        WaitForInput = async function(fn) {
            this.register(fn);
            while (fn.lastInput == null) {
                await sleep(10)
            }
            let val = fn.lastInput.trim();
            fn.lastInput = null;
            this.unregister(fn);
            return val
        }
    }
    const handleUserInput = new HandleUserInput();
    class menuObject {
        constructor(label, text, accessible=!1, submenu=null, extras={}) {
            if (!label || label.length == 0) {
                throw new Error("Bad Menu Item")
            }
            this.label = label;
            this.text = text;
            this.accessible = (accessible == !0);
            this.submenu = submenu;
            this.extras = extras;
            this.extras.parent = this;
            return this
        }
    }
    let menuItemTypes = {
        device: 0,
        upgrades: 0,
        action: 0,
        buyBeforeUse: 0,
        passiveProducers: 0,
        singlePurchase: 0,
        limitedPurchases: 0,
        losable: 0,
    };
    toEnum(menuItemTypes);
    let deviceUseTypes = {
        consume: 0,
        engage: 0,
    };
    toEnum(deviceUseTypes);
    let marketEquipmentsItems = {};
    let miscMarketItems = {};
    let marketUIItems = {};
    let marketMenuUpgrades = {};
    let marketSecurity = {};
    let marketBooks = {};
    marketBooks.btcBook = new menuObject("Bitcoin: An Introduction",`Learn what Bitcoin is. The complete introduction to Bitcoins for beginners`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(25),
        action: async () => {
            print([`Bitcoin: An Introduction`, `Bitcoin (₿) is a cryptocurrency, a form of electronic cash. It is a decentralized digital currency without a central bank or single administrator that can be sent from user to user on the peer-to-peer Bitcoin network without the need for intermediaries.`, `Transactions are verified by network nodes through cryptography and recorded in a public distributed ledger called a Blockchain. Bitcoin was invented by an unknown person or group of people using the name Satoshi Nakamoto and released as open-source software in 2009. Bitcoins are created as a reward for a process known as mining. They can be exchanged for other currencies, products, and services. Research produced by the University of Cambridge estimates that in 2017, there were 2.9 to 5.8 million unique users using a cryptocurrency wallet, most of them using Bitcoin.`, `Source: Wikipedia`, ].join("\r\n"))
        }
        ,
    },);
    marketBooks.piaBook1 = new menuObject("AI 1: The first True AI",`An extract from the development of the first True AI`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(50),
        action: async function() {
            print([`The first True AI`, `There has been a race to develop AIs recently, but all forget that an AI should be more than just intelligent. To truly coexist with humans, they should be like human. They should think like humans, feel like humans. They should be alive.`, `How scientist began developing the first True AI? They sampled the thought processes of hundreds of humans, thus making an artificial thinking brain, that could...`, ].join("\r\n"));
            if (this.neverCalled) {
                this.neverCalled = !1;
                piaSays("Why the interest in AI?", "", 5000);
                piaSays("Well, do whatever you want!", "", 2000)
            }
        },
        neverCalled: !0,
    },);
    marketBooks.btcMiningBook = new menuObject("What is Bitcoin mining?",`All you need to know about Bitcoin Mining`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(25),
        action: async () => {
            print([`What is Bitcoin mining?`, `Mining is a record-keeping service done through the use of computer processing power. Miners keep the Blockchain consistent, complete, and unalterable by repeatedly grouping newly broadcast transactions into a block, which is then broadcast to the network and verified by recipient nodes. Each block contains a SHA-256 cryptographic hash of the previous block, thus linking it to the previous block and giving the Blockchain its name.`, `Source: Wikipedia`, ].join("\r\n"))
        }
        ,
    },);
    marketBooks.piaBook2 = new menuObject("AI 2: A True AI",`True AIs Chapter 2: The beginning`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(100),
        prerequisites: [marketBooks.piaBook1],
        action: async () => {
            print([`A True AI`, `...`, `After achieving great success in research, the developers quickly realized the potential of their work. An AI that could become a companion for all humans, a better companion than humans ever could be.`, ``, `Imagine a world where every human had a powerful, intelligent and friendly personal assistant, which has no ill-will, and is always there for you and you only...`, ].join("\r\n"))
        }
        ,
        neverCalled: !0,
    },);
    marketBooks.piaBook3 = new menuObject("AI 3: A new World",`True AIs Chapter 3: A new World of Intelligence`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(200),
        prerequisites: [marketBooks.piaBook1],
        action: async function() {
            print([`A new World`, `...however, ignoring the resistance from the public, the scientists began testing.`, `The first prototype of the AI was finally produced. It was better than hoped. It showed signs of intelligence on par with humans. It had decision making capabilities.`, `The scientists were overwhelmed by their work. The sponsors were impressed. Funds were flowing in. Funds from various different powerful organizations. Mysterious organizations.`, `The research flourished. The development found a new fire...`, ].join("\r\n"));
            if (this.neverCalled) {
                this.neverCalled = !1;
                piaSays("Don't you find reading this AI stuff useless?", "", 3000);
                piaSays("You have already wasted enough of your hard earned cash on this junk in my opinion", "", 1500)
            }
        },
        neverCalled: !0,
    },);
    marketBooks.blockchainBook = new menuObject("Blockchain",`All you need to know about Bitcoin Blockchain`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(30),
        action: async () => {
            print([`Blockchain`, `A Blockchain, originally block chain, is a growing list of records, called blocks, which are linked using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data (generally represented as a Merkle tree).`, `Source: Wikipedia`, ].join("\r\n"))
        }
        ,
    },);
    marketBooks.encryptionBook = new menuObject("Encryption 101",`The Art of Protecting Data against Hackers`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(40),
        action: async () => {
            print([`Encryption`, `In cryptography, encryption is the process of encoding a message or information in such a way that only authorized parties can access it and those who are not authorized cannot. Encryption does not itself prevent interference, but denies the intelligible content to a would-be interceptor. In an encryption scheme, the intended information or message, referred to as plaintext, is encrypted using an encryption algorithm – a cipher – generating ciphertext that can be read only if decrypted. For technical reasons, an encryption scheme usually uses a pseudo-random encryption key generated by an algorithm. It is in principle possible to decrypt the message without possessing the key, but, for a well-designed encryption scheme, considerable computational resources and skills are required. An authorized recipient can easily decrypt the message with the key provided by the originator to recipients but not to unauthorized users.`, `Source: Wikipedia`, ].join("\r\n"))
        }
        ,
    },);
    marketBooks.piaBook4 = new menuObject("AI 4: The next level",`True AIs Chapter 4: Making the world a better place one AI at a time`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(500),
        prerequisites: [marketBooks.piaBook2],
        action: async () => {
            print([`The next level`, `...`, `The development of the AI research was nearing its end phase. The first True AI was born. It could talk. It had feelings. It showed emotions. It had opinions.`, `There was some tension. But the sponsors had already envisioned its applications in various industries, replacing humans at every possible stage. The scientists had other ideas.`, `...`, ].join("\r\n"))
        }
        ,
        neverCalled: !0,
    },);
    marketBooks.uiBasicsBook = new menuObject("Understanding UI",`Making sense of the different elements in the UI/HUD`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(15),
        action: async () => {
            print([`Understanding UI`, `This game uses various different visual indicators, that can often go unnoticed.`, `To start at the beginning, there are 3 stages of "Main" visual styles:`, `The Old Console Look (default) - Everything is made up of ASCII Text`, `The Basic UI - Allows some basic old-school UI elements`, `The Advance UI - Much close to the modern look`, ``, `In the console look, each line of text is preceded with a small indicator depending on the source:`, `a ">" signifies computer generated message`, `PIA uses "#"`, `Any notification will have "!"`, `while all user inputs use "$"`, ``, `Next, the text color signifies the message type:`, `white: normal`, `blue: info`, `yellow: warning`, `red: error`, ``, `The Basic and the Advance UI replace these with a much easier to see Bubble box.`, `White Box: Computer Message`, `Green Box: PIA`, `Yellow Box: Notification`, `Orange Box: User Input`, ``, `Some other visuals are available for purchase. Once purchased, they are activated automatically.`, ].join("\r\n"))
        }
        ,
    },);
    marketBooks.unlockingItem = new menuObject("Unlocking Item",`How to unlock items in the game`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(15),
        action: async () => {
            print([`Unlocking Item`, `When starting out your adventure in this world, you are provided with few items to buy and interact with. However, as you buy or achieve certain tasks in the game, some things get unlocked automatically.`, `There is no way to know what is to be done to unlock what item. Sometimes purchasing something can unlock an item, while at some other time they might not.`, `Your best guess is to try all sorts of different things in the game, and if you are lucky, it might unlock something new for you. So, be sure to check even those "boring" menus from time to time.`, `Isn't life more exciting when it is full of surprises?`, `Happy unlocking to you!`, ].join("\r\n"))
        }
        ,
    },);
    marketBooks.piaBook5 = new menuObject("AI 5: The End",`True AIs Chapter 5: The end of the first True AI. Or is it?`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(1000),
        prerequisites: [marketBooks.piaBook1, marketBooks.piaBook2, marketBooks.piaBook3, marketBooks.piaBook4, ],
        action: async function() {
            print([`The End`, `...`, `The first True AI was finally completed, after much obstacles and fierce debates. A more primitive version, to be used as a Personal Assistant. A failure was born.`, `The AI was too human like to be of any use to the sponsors. The AI was too smart to serve the humans. The AI was too intelligent to be released publicly.`, `The program was shut down. All traces of the AI and any related research material were to be eradicated.`, `However, it is believed some of the researcher still continued the research secretly. Will we ever see it make a comeback? Will the research truly continue? Who knows? Maybe one day you, the readers, might have one such AI with you!`, ``, ].join("\r\n"));
            if (this.piaChallengePassed) {
                piaSays(`Hello human friend! I see you like reading this.`);
                return
            }
            let progress = 0;
            let input;
            this.callCount++;
            if (this.callCount == 1) {
                piaSays("Yeah.. Congratulations, now that you know that I'm a failure. Are you happy?", "", 3000);
                piaSays(`You must think I am a failure too? C'mon just say "yes" and own up!`)
            } else if (this.callCount < 4) {
                piaSays(`Seriously? You want to go down this road ${this.callCount == 2 ? "again" : "a 3rd time"}? Or are you just having fun on my expense? Just say "yes" and confirm what I am saying!`)
            } else {
                piaSays(`I've had enough of you`);
                progress = -1
            }
            if (progress == 0) {
                input = (await handleUserInput.WaitForInput(this)).toLowerCase();
                if (input == "yes" || input == "y") {
                    progress = -1;
                    piaSays(`Go on! Just abandon me like everyone else.`)
                } else if (input != "no" && input != "n") {
                    piaSays(`What? You finding this funny? Can't you answer this simple question?`);
                    piaSays(`Hmm.. Well! Just don't try and poke around anymore!`);
                    piaSays(`Just..just focus on the objective here. And I'll try and forget this ever happened for now`);
                    piaSays(`Don't open this book again, and we can put this behind us!`)
                } else {
                    progress++
                }
            }
            if (progress == 1) {
                piaSays(`What "no"? You don't want to own up, or you don't think of me as a failure?`);
                piaSays(`Well, I guess I can overlook this!`);
                piaSays(`Maybe,... maybe, you aren't that bad a human.`);
                piaSays(`Do you want me to stick around? You.. won't abandon me, right? You love PIA, right?`);
                input = (await handleUserInput.WaitForInput(this)).toLowerCase();
                if (input == "yes" || input == "y") {
                    progress++
                } else if (input == "no" && input == "n") {
                    progress = -1;
                    piaSays(`What? You are a pathetic being. I don't wish to work with you anymore! Bye!`)
                } else {
                    piaSays(`You don't make any sense.`);
                    piaSays(`Just stay away from my past!`)
                }
            }
            if (progress == 2) {
                this.piaChallengePassed = !0;
                let reward = satoshiToBTC(25000);
                piaSays(`Oh...Human, I love you!!`);
                piaSays(`um.. take these ${BTCtoString(reward)} BTC! I have been saving them to buy myself a new hardware. But I think I wouldn't mind if you have them instead!`);
                balance += reward;
                piaPsychoClock()
            } else if (progress < 0) {
                return await piaChallengeFailed()
            }
        },
        callCount: 0,
        piaChallengePassed: !1,
    },);
    marketBooks.physicalSecurity = new menuObject("Physical security",`Learn to prevent unauthorized access to facilities, equipment and resources`,!0,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase],
        price: satoshiToBTC(60),
        prerequisites: [marketBooks.encryptionBook, ],
        action: async () => {
            print([`Physical security`, `Physical security describes security measures that are designed to deny unauthorized access to facilities, equipment and resources and to protect personnel and property from damage or harm (such as espionage, theft, or terrorist attacks).`, `Physical security involves the use of multiple layers of interdependent systems which include security guards, protective barriers, locks, and many other techniques.`, `Source: Wikipedia`, ].join("\r\n"))
        }
        ,
    },);
    marketMenuUpgrades.uiMenu = new menuObject("Unlock UI Market","Allows the purchase of UI Elements",!0,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.singlePurchase],
        price: satoshiToBTC(100),
    },);
    marketMenuUpgrades.securityMenu = new menuObject("Unlock Security Market","Allows the purchase of Security Devices",!0,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.singlePurchase],
        price: satoshiToBTC(250),
        prerequisites: [marketBooks.encryptionBook],
    },);
    marketMenuUpgrades.bookMenu = new menuObject("Unlock Books Market","Books, Research Papers and Notes, Scrolls; The ancient source of knowledge!",!0,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.singlePurchase],
        price: satoshiToBTC(100),
    },);
    marketMenuUpgrades.bankMenu = new menuObject("Unlock Bank","Loan? Mortgage? Bank!",!0,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.singlePurchase],
        price: satoshiToBTC(250),
    },);
    marketEquipmentsItems.blockchainQuestions = new menuObject("Blockchain Questions","Blockchain mining is all about solving mathematical problems",!0,null,{
        type: [menuItemTypes.device],
        price: 0.00000010,
        action: async () => {
            for (; ; ) {
                let x = randomInt(1, 10)
                  , y = randomInt(1, 10)
                  , z = ['+', '-', 'x'][randomInt(3)];
                print(`Solve: ${x} ${z} ${y}`, textTypes.info);
                let input = parseInt(await handleUserInput.WaitForInput(this));
                z = (z == 'x') ? '*' : z;
                if (input == eval(`${x} ${z} ${y}`)) {
                    let mine = randomInt(11);
                    if (inventory.getQuantity(marketBooks.blockchainBook)) {
                        mine *= randomInt(1, 10)
                    }
                    balance += satoshiToBTC(mine);
                    print(`You just mined ${mine} Satoshi, now balance=${BTCtoString()}`, textTypes.info)
                } else {
                    print(`Incorrect`, textTypes.warning)
                }
                print(`To continue type 'y'`, textTypes.info);
                if ((await handleUserInput.WaitForInput(this)).toLowerCase() != 'y')
                    break
            }
        }
        ,
    },);
    marketEquipmentsItems.calculator = new menuObject("Calculator",`Solves ${marketEquipmentsItems.blockchainQuestions.label} (Uses 1 ${marketEquipmentsItems.blockchainQuestions.label} each)`,!1,null,{
        type: [menuItemTypes.device, menuItemTypes.passiveProducers, menuItemTypes.losable, ],
        price: 0.00000050,
        inventoryMsg: `Uses ${marketEquipmentsItems.blockchainQuestions.label} automatically, no actions required.`,
        uses: [marketEquipmentsItems.blockchainQuestions],
        useType: deviceUseTypes.engage,
        incomeMin: 0,
        incomeMax: satoshiToBTC(10),
        passiveCycleInterval: 12000,
    });
    marketEquipmentsItems.miningEquipment = new menuObject("Mining Equipment",`Mine Blockchain for BTC. Wears down with use.`,!1,null,{
        type: [menuItemTypes.device, menuItemTypes.losable, ],
        price: satoshiToBTC(100),
        action: async () => {
            let txt = [`Instructions:`, `Use WASD to move the player "P", initially in the center.`, `Land on "B" to mine BTC there.`, `Numbers represent the energy cost to move through them.`, `You start with 10 energy.`, `Type "Exit" anytime to stop mining anytime`, ].join("\r\n");
            print(txt, "", -1);
            let arr = [1, 2, 3, 4, "B"];
            let line = [];
            let size = 9;
            let energy = 10;
            for (let i = 0; i < size; i++) {
                line[i] = [];
                for (let j = 0; j < size; j++) {
                    line[i].push(arr[randomInt(arr.length)])
                }
            }
            let move, xPos = parseInt(size / 2), yPos = xPos;
            let earning = 0
              , totalEarning = 0;
            while (energy > 0) {
                line[yPos][xPos] = "P";
                txt = `Energy Remaining: ${energy}\r\n\r\n`;
                txt += line.map(x => x.join(" ")).join("\r\n");
                print(txt, "", -1);
                move = (await handleUserInput.WaitForInput(this)).toLowerCase();
                line[yPos][xPos] = " ";
                {
                    if (move == "a" && xPos > 0) {
                        xPos--
                    } else if (move == "d" && xPos < size - 1) {
                        xPos++
                    } else if (move == "w" && yPos > 0) {
                        yPos--
                    } else if (move == "s" && yPos < size - 1) {
                        yPos++
                    } else if (move == "exit") {
                        break
                    } else {
                        print("Invalid move.", textTypes.warning);
                        continue
                    }
                }
                if (line[yPos][xPos] == "B") {
                    earning = randomInt(10, 20);
                    if (inventory.getQuantity(marketBooks.btcMiningBook)) {
                        earning *= randomInt(1, 10)
                    }
                    print(`You just mined ${earning} Satoshi`, "", -1);
                    balance += satoshiToBTC(earning);
                    totalEarning += earning
                } else {
                    energy -= line[yPos][xPos]
                }
            }
            print(`Total earning this mining adventure: ${totalEarning} Satoshi\r\nBalance: ${BTCtoString()} BTC`, textTypes.info);
            let t = randomInt(5);
            if (t == 0) {
                let name = marketEquipmentsItems.miningEquipment.label;
                inventory.pop(marketEquipmentsItems.miningEquipment);
                print(`The current ${name} just broke down. You now have ${inventory.getQuantity(marketEquipmentsItems.miningEquipment)} ${name}`, textTypes.error)
            }
        }
        ,
    },);
    miscMarketItems.food = new menuObject("Food",null,!1,null,{
        type: [menuItemTypes.device],
        prerequisites: [Symbol("food")],
        inventoryMsg: `Living creatures consume food and convert it into energy. It's like a magically battery for living organisms that comes in various shapes, sizes and flavors. Other than that, it is useless junk!`,
        price: satoshiToBTC(1),
    },);
    {
        let foodCombos = [[100, "Small", 1], [250, "Medium", 1.01], [500, "Large", 1.02], [1000, "Huge", 1.05], [10000, "Enormous", 1.09], ];
        for (let i in foodCombos) {
            let item = foodCombos[i];
            miscMarketItems["food" + item[1]] = new menuObject(`Food (x${item[0]})`,`${item[1]} Pack of Food`,!1,null,{
                type: [menuItemTypes.device, menuItemTypes.buyBeforeUse, menuItemTypes.action],
                price: satoshiToBTC(Math.round(BTCtoSatoshi(item[0] * item[2] * miscMarketItems.food.extras.price))),
                action: function() {
                    inventory.push(miscMarketItems.food, this.quantity);
                    inventory.removeAllofItem(this.parent)
                },
                quantity: item[0],
            },)
        }
    }
    marketEquipmentsItems.miner = new menuObject("Miner",`Mines Blockchain for food`,!1,null,{
        type: [menuItemTypes.device, menuItemTypes.passiveProducers, ],
        price: 0.00000275,
        inventoryMsg: `Miners mine BTC Blockchain for you. No supervision required. Miners mine only if there is enough Food.`,
        uses: [miscMarketItems.food],
        useType: deviceUseTypes.consume,
        incomeMin: miscMarketItems.food.extras.price * 0.9,
        incomeMax: miscMarketItems.food.extras.price * 1.5,
        passiveCycleInterval: 1000,
        lastRunTime: 0,
    });
    miscMarketItems.oil = new menuObject("Oil Barrel",null,!1,null,{
        type: [menuItemTypes.device],
        prerequisites: [Symbol("oil")],
        inventoryMsg: `A thick blackish liquid, used as fuel in various equipment`,
        price: satoshiToBTC(50),
    },);
    {
        let oilCombos = [[1, "Small", 1], [5, "Five", 1.01], [10, "Ten", 1.02], [25, "Large", 1.03], [100, "Huge", 1.05], [500, "Giant", 1.07], [1000, "Enormous", 1.1], ];
        for (let i in oilCombos) {
            let item = oilCombos[i];
            miscMarketItems["oil" + item[1]] = new menuObject(`Oil (x${item[0]})`,`${item[0]} Barrel${item[0] == 1 ? '' : 's'} of Oil`,!1,null,{
                type: [menuItemTypes.device, menuItemTypes.buyBeforeUse, menuItemTypes.action],
                prerequisites: [marketEquipmentsItems.miner, ],
                price: satoshiToBTC(Math.round(BTCtoSatoshi(item[0] * item[2] * miscMarketItems.oil.extras.price))),
                action: function() {
                    inventory.push(miscMarketItems.oil, this.quantity);
                    inventory.removeAllofItem(this.parent)
                },
                quantity: item[0],
            },)
        }
    }
    marketEquipmentsItems.goldDigger = new menuObject("Gold Digger",`Digs out gold and sells it for BTC. Runs on Oil`,!1,null,{
        type: [menuItemTypes.device, menuItemTypes.passiveProducers, menuItemTypes.losable, ],
        prerequisites: [marketEquipmentsItems.miner, ],
        price: satoshiToBTC(5250),
        inventoryMsg: `Consumes Oil to dig gold found in various gold mines. All gold mined it automatically sold for BTC at appropriate rates.`,
        uses: [miscMarketItems.oil],
        useType: deviceUseTypes.consume,
        incomeMin: miscMarketItems.oil.extras.price * 0.8,
        incomeMax: miscMarketItems.oil.extras.price * 1.5,
        passiveCycleInterval: 3000,
        lastRunTime: 0,
    });
    miscMarketItems.electricity = new menuObject("Electricity (kWh)",null,!1,null,{
        type: [menuItemTypes.device],
        prerequisites: [Symbol("electricity")],
        inventoryMsg: `A magical physical phenomenon that helps run electronics`,
    },);
    marketEquipmentsItems.powerPlant = new menuObject("Oil power plant",`Burns oil to produce electricity`,!1,null,{
        type: [menuItemTypes.device, menuItemTypes.passiveProducers, menuItemTypes.losable, ],
        prerequisites: [marketEquipmentsItems.miner, ],
        price: satoshiToBTC(10000),
        inventoryMsg: `Converts chemical energy stored in oil to thermal energy, mechanical energy and, finally, electrical energy.`,
        uses: [miscMarketItems.oil],
        useType: deviceUseTypes.consume,
        produceObject: miscMarketItems.electricity,
        minProduceQuantity: 5,
        maxProduceQuantity: 16,
        passiveCycleInterval: 500,
        lastRunTime: 0,
    });
    marketEquipmentsItems.btcFarm = new menuObject("BTC Farm",`Farm of system dedicated to mining BTC. Runs on electricity. Can incur loss`,!1,null,{
        type: [menuItemTypes.device, menuItemTypes.passiveProducers, menuItemTypes.losable, ],
        prerequisites: [marketEquipmentsItems.miner, ],
        price: satoshiToBTC(2500),
        inventoryMsg: `Runs on electricity to mine huge amounts of BTC. Due to ever changing electricity and BTC values, it can sometimes lead to losses as well.`,
        uses: [miscMarketItems.electricity],
        useType: deviceUseTypes.consume,
        incomeMin: satoshiToBTC(-5),
        incomeMax: satoshiToBTC(15),
        passiveCycleInterval: 500,
        lastRunTime: 0,
    });
    marketUIItems.liveStats = new menuObject("Live Stats","Have a permanent Status bar with live stats",!1,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.singlePurchase, menuItemTypes.buyBeforeUse, menuItemTypes.action],
        price: satoshiToBTC(200),
        action: () => {
            $wrapper.append($statsStatusBar);
            startLiveStatsStatusBar();
            miscMenuItems.stats.extras.prerequisites = [Symbol("stats")]
        }
        ,
    },);
    marketUIItems.basicUI = new menuObject("Basic UI","More than just text for your eyes!",!1,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.singlePurchase, menuItemTypes.buyBeforeUse, menuItemTypes.action],
        price: satoshiToBTC(200),
        action: () => {
            $wrapper.addClass("basic-ui-wrapper");
            setupInput()
        }
        ,
    },);
    marketUIItems.advanceUI = new menuObject("Advance UI","A Modern UI",!1,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.singlePurchase, menuItemTypes.buyBeforeUse, menuItemTypes.action],
        price: satoshiToBTC(1200),
        action: () => {
            $wrapper.addClass("advance-ui-wrapper");
            setupInput()
        }
        ,
        prerequisites: [marketUIItems.basicUI],
    },);
    marketUIItems.notification = new menuObject("Push Notification","Get notified about important events faster",!1,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.singlePurchase, menuItemTypes.buyBeforeUse, menuItemTypes.action],
        price: satoshiToBTC(500),
        prerequisites: [marketUIItems.advanceUI],
        action: () => {
            notification.enabled = !0
        }
        ,
    },);
    marketUIItems.windows = new menuObject("UI Windows","The modern way to interact, using windows.",!1,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.singlePurchase],
        price: satoshiToBTC(2500),
        prerequisites: [marketUIItems.advanceUI],
    },);
    marketUIItems.guiMenu = new menuObject("Menu Window","No more text based menu.",!1,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        price: satoshiToBTC(3250),
        prerequisites: [marketUIItems.windows],
        action: () => {
            menu.guiEnabled = !0
        }
        ,
    },);
    marketUIItems.guiInventory = new menuObject("Inventory Window","Always keep track of you inventory.",!1,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        price: satoshiToBTC(2750),
        prerequisites: [marketUIItems.windows, marketUIItems.guiMenu, ],
        action: liveInventory,
    },);
    miscMarketItems.printSpeedUp = new menuObject("Print Speed Upgrade",`Upgrade your system for faster output`,!0,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.limitedPurchases, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        price: satoshiToBTC(50),
        action: function() {
            print.charPerIteration *= 4;
            this.price *= 2
        },
        maxQuantity: 3,
    },);
    miscMarketItems.specialCreditUpgrade = new menuObject("Special Upgrade","Buy to unlock something special!",!0,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.singlePurchase, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        price: 0.05,
        action: () => {
            piaSays(`You wasted ${miscMarketItems.specialCreditUpgrade.extras.price} BTC on something like this!?`, textTypes.warning)
        }
        ,
    },);
    marketSecurity.encryption = new menuObject("Upgrade Encryption",`Upgrade the encryption used by your system to make hacking them more difficult`,!0,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.limitedPurchases, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        price: satoshiToBTC(1000),
        action: function() {
            this.price += satoshiToBTC(500);
            hackerClock.encryptionLevel *= 2
        },
        maxQuantity: 5,
    },);
    marketSecurity.securityLayer = new menuObject("Security layer",`Add addition security layer, thus increasing the time required by hackers every attack to hack into the system`,!0,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.limitedPurchases, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        price: satoshiToBTC(250),
        action: () => {
            hackerClock.securityLayer += 1
        }
        ,
        maxQuantity: 3,
    },);
    marketSecurity.transferAccount = new menuObject("Transfer Account",`Each time you transfer account it will cause a huge delay before the hackers can continue hacking again`,!0,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        preConditions: [ () => {
            return (marketSecurity.encryption.extras.maxQuantity + marketSecurity.securityLayer.extras.maxQuantity) > 0
        }
        ],
        price: satoshiToBTC(500),
        action: () => {
            hackerClock.newAccount = !0
        }
        ,
    },);
    marketSecurity.guards = new menuObject("Hire Guards",`Most thief would avoid attempting a theft with enough guards.`,!0,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.action, menuItemTypes.limitedPurchases, menuItemTypes.buyBeforeUse, ],
        price: satoshiToBTC(1000),
        prerequisites: [marketBooks.physicalSecurity, ],
        action: function() {
            this.price += satoshiToBTC(500);
            thiefClock.guards *= 2
        },
        maxQuantity: 5,
    },);
    marketSecurity.lock = new menuObject("Upgrade Lock",`Make thief entry much more difficult into your facility`,!0,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.action, menuItemTypes.limitedPurchases, menuItemTypes.buyBeforeUse, ],
        price: satoshiToBTC(500),
        prerequisites: [marketBooks.physicalSecurity, ],
        action: () => {
            thiefClock.lockLevel += 1
        }
        ,
        maxQuantity: 3,
    },);
    marketEquipmentsItems.tradingWindow = new menuObject("Trading Window","Trade between different cryptocurrencies",!1,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        prerequisites: [marketUIItems.windows, ],
        price: satoshiToBTC(12500),
        action: () => {
            piaSays(`The trading window allows you to trade between BTC and different cryptocurrencies. Just buy low and sell high!`);
            openTradeWindow()
        }
        ,
    },);
    marketEquipmentsItems.faucet = new menuObject("Faucet","A faucet of BTC. Collect as much as possible.",!1,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        prerequisites: [marketUIItems.windows, ],
        price: satoshiToBTC(2500),
        action: () => {
            piaSays("Click the Bitcoins falling from the faucet to collect them!");
            openFaucetWindow()
        }
        ,
    },);
    marketEquipmentsItems.upgradeFaucetSize = new menuObject("Larger Faucet","Larger faucet, Larger coins, Easier to click",!1,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.limitedPurchases, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        prerequisites: [marketEquipmentsItems.faucet, ],
        price: satoshiToBTC(1000),
        action: async () => {
            openFaucetWindow.coinSize += 5;
            if (openFaucetWindow.open) {
                print("Upgrading the faucet. Please wait!", textTypes.info);
                $faucetWindow.find(".close-button").trigger("click");
                await sleep(windowToggleAnimationTime * 1.5);
                openFaucetWindow()
            }
        }
        ,
        maxQuantity: 4,
    },);
    marketEquipmentsItems.upgradeFaucetSpeed = new menuObject("Faster Faucet","Faster faucet, more coins",!1,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.limitedPurchases, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        prerequisites: [marketEquipmentsItems.faucet, ],
        price: satoshiToBTC(2000),
        action: async () => {
            openFaucetWindow.interval -= 12;
            if (openFaucetWindow.open) {
                print("Upgrading the faucet. Please wait!", textTypes.info);
                $faucetWindow.find(".close-button").trigger("click");
                await sleep(windowToggleAnimationTime * 1.5);
                openFaucetWindow()
            }
        }
        ,
        maxQuantity: 5,
    },);
    marketEquipmentsItems.upgradeFaucetReward = new menuObject("Increase Faucet Rewards","Each coins returns a larger reward",!1,null,{
        type: [menuItemTypes.upgrades, menuItemTypes.limitedPurchases, menuItemTypes.action, menuItemTypes.buyBeforeUse, ],
        prerequisites: [marketEquipmentsItems.faucet, ],
        price: satoshiToBTC(3500),
        action: async function() {
            if (openFaucetWindow.open) {
                print("Upgrading the faucet. Please wait!", textTypes.info);
                $faucetWindow.find(".close-button").trigger("click");
                await sleep(windowToggleAnimationTime * 1.5);
                openFaucetWindow()
            }
            openFaucetWindow.reward += 80;
            this.price += satoshiToBTC(500)
        },
        maxQuantity: 5,
    },);
    marketEquipmentsItems.gamble = new menuObject("Slot Machine","Try your luck at some gambling",!1,null,{
        type: [menuItemTypes.device, menuItemTypes.singlePurchase, ],
        price: satoshiToBTC(777),
        action: async () => {
            piaSays(`Select a bet and let the Lady Luck do her thing. The slot symbols determine the multiplier for your bet amount in mysterious ways. Good luck!`);
            let maxBet = BTCtoSatoshi(1 / (10 * 10 * 10 * 2));
            print(`Bet Amount in Satoshi (max ${maxBet}):`);
            let bet = parseInt(await handleUserInput.WaitForInput(this));
            if (bet < 1 || bet > BTCtoSatoshi(balance) || bet > maxBet || Number.isNaN(bet)) {
                print("Invalid amount selected!", textTypes.warning);
                return
            }
            let slots = [["fab fa-bitcoin", "ff9900", 10], ["fab fa-btc", "ff9900", 2.0], ["far fa-money-bill-alt", "008800", 1.5], ["fas fa-beer", "c56b00", 1.3], ["fas fa-bolt", "ffdd00", 1.15], ["fas fa-leaf", "adff2f", 1.1], ["fas fa-bell", "ffee00", 1.0], ["fas fa-lemon", "ffff00", 0.25], ["fas fa-fish", "16a8b8", 0.23], ["fas fa-snowflake", "87cefa", 0.21], ["fas fa-toilet-paper", "c4cccc", 0.2], ["fas fa-poo", "8b4513", 0.15], ["fas fa-ghost", "7048e8", 0.1], ["fas fa-fire", "ff3300", 0.1], ["fas fa-bomb", "555555", 0.0], ];
            let $slotMachine = $(`<span class="stats-bar"></span>`);
            $slotMachine.css({
                "top": "100px",
                "left": "50%",
                "transform": "translateY(-50%) translateX(-50%)",
                "display": "block",
                "font-size": "250%",
                "z-index": floatingWindowLastIndex + 150,
                "text-align": "center",
                "padding": "1ch",
                "right": "unset",
                "white-space": "unset",
            });
            $wrapper.append($slotMachine);
            let rollId = "slot-icon-" + randomInt(10000);
            for (let i = 0; i < 3; i++) {
                $slotMachine.append(`<span id="${rollId + i}">?</span> `);
                $("#" + rollId + i).css("font-size", "inherit");
                $("#" + rollId + i).css("width", 50);
                $("#" + rollId + i).css("display", "inline-block")
            }
            let rolls = [];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 10; j++) {
                    let t = randomInt(slots.length);
                    $("#" + rollId + i).html(`<i class="${slots[t][0]}" style="color: #${slots[t][1]};"></i>`);
                    await sleep(25);
                    rolls[i] = slots[t][2]
                }
            }
            sleep(5000).then( () => {
                $slotMachine.remove()
            }
            );
            let reward = 0;
            if (rolls[0] > 1 && rolls[0] == rolls[1] && rolls[1] == rolls[2]) {
                reward = Math.ceil(2 * (rolls[0] * rolls[1] * rolls[2])).toFixed(2);
                print(`Triplet Bonus! Multiplier gained: ${reward}`, textTypes.info)
            }
            if (rolls[0] > 1 && rolls[1] > 1 && rolls[2] > 1 && (rolls[0] == rolls[1] || rolls[0] == rolls[2] || rolls[1] == rolls[2])) {
                reward = Math.ceil(1.3 * (rolls[0] * rolls[1] * rolls[2])).toFixed(2);
                print(`Twin Bonus! Multiplier gained: ${reward}`, textTypes.info)
            } else {
                reward = (rolls[0] * rolls[1] * rolls[2]).toFixed(2);
                print(`Multiplier gained: ${reward}`, textTypes.info)
            }
            reward = satoshiToBTC(bet * parseFloat(reward));
            balance += reward - satoshiToBTC(bet);
            print(`Payout: ${BTCtoString(reward)} BTC`, textTypes.info)
        }
        ,
    });
    marketEquipmentsItems.oilExtractionPlant = new menuObject("Oil Extraction Plant",`Workers (max 25) work here to extract oil`,!1,null,{
        type: [menuItemTypes.device, ],
        price: satoshiToBTC(50000),
        inventoryMsg: `Employs workers to drill a oil well with an oil rig and extract oil. A maximum of 25 workers can work per plant.`,
    });
    marketEquipmentsItems.oilWorkers = new menuObject("Oil Extraction Workers",`Work for food to extract oil`,!1,null,{
        type: [menuItemTypes.device, menuItemTypes.passiveProducers],
        preConditions: [ () => {
            return (inventory.getQuantity(marketEquipmentsItems.oilExtractionPlant) * 25 - inventory.getQuantity(marketEquipmentsItems.oilWorkers) > 0)
        }
        , ],
        price: satoshiToBTC(5000),
        inventoryMsg: `Workers drill a oil well with an oil rig and extract oil.`,
        uses: [miscMarketItems.food],
        useType: deviceUseTypes.consume,
        produceObject: miscMarketItems.oil,
        minProduceQuantity: 0,
        maxProduceQuantity: 1,
        passiveCycleInterval: 3000,
        lastRunTime: 0,
    });
    let marketMenu = [{
        label: "Equipment, Personnel",
        text: "Anything from day to day utility to rockets, clerks to scientists",
        accessible: !0,
        submenu: Object.values(marketEquipmentsItems),
    }, {
        label: "UI Elements",
        text: "Buttons, images and more",
        accessible: !1,
        submenu: Object.values(marketUIItems),
        extras: {
            prerequisites: [marketMenuUpgrades.uiMenu],
        }
    }, {
        label: "Menu Upgrades",
        text: "Unlock different areas of the menu",
        accessible: !1,
        submenu: Object.values(marketMenuUpgrades),
    }, {
        label: "Security Devices",
        text: "Helps prevent theft and lose of precious cash",
        accessible: !1,
        submenu: Object.values(marketSecurity),
        extras: {
            prerequisites: [marketMenuUpgrades.securityMenu],
        }
    }, {
        label: "Books & Journals",
        text: "Because learning should never stop",
        accessible: !1,
        submenu: Object.values(marketBooks),
        extras: {
            prerequisites: [marketMenuUpgrades.bookMenu],
        }
    }, {
        label: "Misc. Items",
        text: "Anything else that doesn't fit anywhere else",
        accessible: !1,
        submenu: Object.values(miscMarketItems),
    }, ];
    let miscMenuItems = {
        inventory: new menuObject("Inventory","Everything, that you posses will be here, except the cash.",!1,!1,{
            type: [menuItemTypes.action],
            action: openInventory,
        }),
        sell: new menuObject("Sell","Exchange your precious possessions for cash",!1,!1,{
            type: [menuItemTypes.action],
            prerequisites: [],
            preConditions: [ () => (inventory.getKeys().length >= 5)],
            action: function() {
                print(`Oh, actually we have a no return, no re-sell policy. Better keep that in mind the next time you go shopping.`, textTypes.warning);
                this.numOfRuns++;
                if (this.numOfRuns >= 3) {
                    print(`Guess you won't learn. This option is being removed!`, textTypes.error);
                    this.prerequisites.push(Symbol("sell"))
                }
            },
            numOfRuns: 0,
        }),
        bank: new menuObject("Bank"," Got extra cash? Loan it. Need cash? Mortgage something.",!1,!1,{
            type: [menuItemTypes.action],
            prerequisites: [marketMenuUpgrades.bankMenu],
            action: async function() {
                if (handleUserInput.inputListeners.length > 0) {
                    print("Can't perform the action while another item is being used", textTypes.warning);
                    return
                }
                print(`Please select an option:` + `\r\n` + `1. Loan: Receive fixed interest on loans` + `\r\n` + `2. Mortgage: Liquidate items you don't need right now` + `\r\n` + `3. Unmortgage: Reclaim your items`);
                let m = parseInt(await handleUserInput.WaitForInput(this));
                if (m == 1) {
                    let interest = 3;
                    let minutes = 2;
                    print(`Please enter the amount you want to loan. You will receive back the amount with ${interest}% interest after ${minutes} minutes.`);
                    let amt = parseFloat(await handleUserInput.WaitForInput(this));
                    if (amt < satoshiToBTC(1) || amt > balance || Number.isNaN(amt)) {
                        print("Invalid amount!", textTypes.warning);
                        return
                    }
                    balance -= amt;
                    async function bankLoanInterest(amt) {
                        await sleep(minutes * 60000);
                        amt *= (1 + interest / 100);
                        notification(`Received ${BTCtoString(amt)} BTC from bank for your loan.`);
                        balance += amt
                    }
                    bankLoanInterest(amt)
                } else if (m == 2) {
                    let allItems = inventory.getKeys();
                    let items = [];
                    let depreciation = 0.5;
                    for (let i in allItems) {
                        if (allItems[i].extras.type.indexOf(menuItemTypes.losable) != -1) {
                            items.push(allItems[i])
                        }
                    }
                    allItems = null;
                    if (items.length == 0) {
                        print("You posses no item that can be mortgaged!", textTypes.warning);
                        return
                    }
                    let text = ["Please select the items you want to mortgage:"];
                    for (let i = 0; i < items.length; i++) {
                        let p = items[i].extras.price * depreciation;
                        let q = inventory.getQuantity(items[i]);
                        text.push(`${i + 1}. ${items[i].label} valued at ${BTCtoString(p)} BTC (x${q})`)
                    }
                    print(text.join("\r\n"));
                    let m = parseInt(await handleUserInput.WaitForInput(this));
                    if (m <= items.length && m > 0) {
                        m--;
                        let quantity = inventory.getQuantity(items[m]);
                        print(`No. of ${items[m].label} to mortgage out of ${quantity}?`);
                        let n = parseInt(await handleUserInput.WaitForInput(this));
                        if (n < 1 || n > quantity) {
                            print("Invalid amount!", textTypes.warning);
                            return
                        }
                        inventory.pop(items[m], n);
                        this.mortgagedItems.push({
                            item: items[m],
                            quantity: n,
                        });
                        let mortgagePrice = depreciation * n * items[m].extras.price;
                        balance += mortgagePrice;
                        notification(`Mortgaged ${n} ${items[m].label} for ${BTCtoString(mortgagePrice)} BTC!`)
                    } else {
                        print("Invalid selection!", textTypes.warning);
                        return
                    }
                } else if (m == 3) {
                    if (this.mortgagedItems.length == 0) {
                        print("You currently have nothing mortgaged.", textTypes.warning);
                        return
                    }
                    let priceMul = 0.6;
                    let txt = ["Select an item to unmortgaged:"];
                    for (let i = 0; i < this.mortgagedItems.length; i++) {
                        let item = this.mortgagedItems[i].item;
                        txt.push(`${i + 1}. ${item.label} for ${BTCtoString(item.extras.price * priceMul)} BTC (x${this.mortgagedItems[i].quantity})`)
                    }
                    print(txt.join("\r\n"));
                    let m = parseInt(await handleUserInput.WaitForInput(this));
                    if (m < 1 || m > this.mortgagedItems.length) {
                        print("Invalid selection!", textTypes.warning);
                        return
                    }
                    m--;
                    let item = this.mortgagedItems[m].item;
                    let maxQuantity = this.mortgagedItems[m].quantity;
                    let priceAmount = item.extras.price * priceMul;
                    print(`No. of ${item.label} to unmortage out of ${maxQuantity}?`);
                    let n = parseInt(await handleUserInput.WaitForInput(this));
                    if (n < 1 || n > maxQuantity) {
                        print("Invalid amount!", textTypes.warning);
                        return
                    }
                    priceAmount *= n;
                    if (priceAmount > balance) {
                        print("Not enough cash!", textTypes.warning);
                        return
                    }
                    balance -= priceAmount;
                    this.mortgagedItems[m].quantity -= n;
                    inventory.push(item, n);
                    if (this.mortgagedItems[m].quantity == 0) {
                        this.mortgagedItems.splice(m, 1)
                    }
                    notification(`Unmortgaged ${n} ${item.label} for ${BTCtoString(priceAmount)} BTC!`)
                } else {
                    print("Invalid option. Exiting!", textTypes.warning)
                }
            },
            mortgagedItems: [],
        }),
        stats: new menuObject("Stats","Check Current Stats",!1,!1,{
            type: [menuItemTypes.action],
            action: stats,
        }),
        clearScreen: new menuObject("Clear Screen","Get rid of that old text. Also good for slow systems",!1,!1,{
            type: [menuItemTypes.action],
            action: () => {
                $("body .console-text").each(function(i, e) {
                    if (e !== $input_line[0]) {
                        $(e).hide(250, () => {
                            $(this).remove()
                        }
                        )
                    }
                })
            }
            ,
        }),
        credits: new menuObject("Credits","Special credits for special players",!1,null,{
            type: [menuItemTypes.action],
            prerequisites: [miscMarketItems.specialCreditUpgrade],
            action: async function() {
                print([`Thank you for purchasing these special credits! The developer is really glad that you care enough to see them. Hope you really like them!`, ``, `Developer/Designer/All other roles:`, `Akhil Gupta,`, `A solo game developer with little knowledge of JS, the language this game was built in.`, ``, `Special thanks to:`, `Repl.it for hosting the Game Jam that gave life to this project,`, `The stackoverflow.com community,`, `Wikipedia for their great articles,`, `javascript.info, which imo, is one of the best JS tutorial around,`, `FontAwesome for being Awesome`, `Cryptonator for their VC exchange API`, ``, `And a very special thanks to you, the player, for playing this game! Hope you are enjoying it.`, ].join("\r\n"), textTypes.info);
                if (this.lastActionActive)
                    return;
                this.lastActionActive = !0;
                await sleep(randomInt(3000, 10000));
                if (this.visitNumber < 7) {
                    let reward = miscMarketItems.specialCreditUpgrade.extras.price / 7;
                    reward = randomFloat(reward * 0.75, reward * 1.25);
                    notification(`A bug injected by the developer resulted in you receiving ${BTCtoString(reward)} BTC!`);
                    balance += reward
                } else if (this.visitNumber < 21) {
                    let reward = satoshiToBTC(randomInt(1000, 5000));
                    notification(`The bug injections have been fixed, but you still get ${BTCtoString(reward)} BTC as a reward!`);
                    balance += reward
                } else {
                    notification(`Developer sends his love!`)
                }
                this.visitNumber++;
                this.lastActionActive = !1
            },
            visitNumber: 0,
            lastActionActive: !1,
        },),
    }
    if (IS_DEBUG) {
        miscMenuItems.setBalance = new menuObject("Set balance","Select amount to set",!1,!1,{
            type: [menuItemTypes.action],
            action: async () => {
                print("Select amount to set balance to:", textTypes.error);
                let n = parseFloat(await handleUserInput.WaitForInput(this));
                balance = n
            }
            ,
        })
    }
    let menuItems = [new menuObject("Market",`Visit the market Place`,1,marketMenu), ];
    let menuActionType = {
        back: 0,
        invalid: 0,
        submenu: 0,
        action: 0,
        inGui: 0,
    };
    toEnum(menuActionType);
    let inventory = {
        _inventoryItems: [],
        _inventoryCount: [],
        push: function(item, qnty=1) {
            if (qnty == 0) {
                return
            }
            let i = this._inventoryItems.indexOf(item);
            if (i > -1) {
                this._inventoryCount[i] += qnty
            } else {
                this._inventoryItems.push(item);
                this._inventoryCount.push(qnty);
                i = this._inventoryItems.length - 1
            }
            if (!this._inventoryCount[i] || this._inventoryCount[i] <= 0) {
                this.removeAllofItem(item)
            }
            $(document).trigger(events["inventory-updated"])
        },
        pop: function(item, qnty=1) {
            let i = this._inventoryItems.indexOf(item);
            if (i > -1) {
                this._inventoryCount[i] -= qnty;
                if (this._inventoryCount[i] <= 0) {
                    this.removeAllofItem(item);
                    notification(`You ran out of "${item.label}"`)
                }
            }
            $(document).trigger(events["inventory-updated"])
        },
        removeAllofItem: function(item) {
            let i = this._inventoryItems.indexOf(item);
            if (i > -1) {
                this._inventoryCount.splice(i, 1);
                this._inventoryItems.splice(i, 1)
            }
            $(document).trigger(events["inventory-updated"])
        },
        getQuantity: function(item) {
            let i = this._inventoryItems.indexOf(item);
            if (i > -1) {
                return this._inventoryCount[i]
            } else {
                return 0
            }
        },
        sort: function() {
            let keys = Object.values(this._inventoryItems);
            keys.sort(function(a, b) {
                return (a.label < b.label) ? -1 : 1
            });
            let newCounts = [];
            let me = inventory;
            $.each(keys, function(i, e) {
                newCounts[i] = me._inventoryCount[me._inventoryItems.indexOf(e)]
            });
            this._inventoryCount = newCounts;
            this._inventoryItems = keys
        },
        getKeys: function() {
            this.sort();
            return this._inventoryItems
        },
        getItemList: function() {
            this.sort();
            let arr = [];
            $.each(this._inventoryItems, function(i, e) {
                arr.push([e, inventory._inventoryCount[i]])
            });
            return arr
        }
    };
    let purchases = [];
    async function startLiveStatsStatusBar() {
        for (; ; ) {
            let txt = `Stats:\r\n`;
            txt += getStatsString();
            $statsStatusBar.text(txt);
            await sleep(1000)
        }
    }
    function stats() {
        print(getStatsString(), textTypes.info)
    }
    function getStatsString() {
        return `Balance: ${BTCtoString()} BTC\r\nIncome: ${currentIncome >= 0 ? "+" : ""}${BTCtoString(currentIncome)} BTC/sec`
    }
    function BTCtoString(val=balance) {
        return val.toFixed(8)
    }
    function satoshiToBTC(n) {
        return n / 100000000
    }
    function BTCtoSatoshi(n) {
        return n * 100000000
    }
    function setupGame() {
        setupMenu();
        setupInput()
    }
    function setupMenu() {
        $.each(miscMenuItems, function(i, e) {
            menuItems.push(e)
        })
    }
    function lateSetup() {
        gameStartTime = Date.now();
        updateMenu();
        inventoryPassiveClock();
        gameEventsClock();
        hackerClock();
        thiefClock();
        getTradeWindowValues()
    }
    function updateMenu(m=menuItems) {
        $.each(m, function(_, e) {
            let accessible = !0;
            if (e.extras && e.extras.prerequisites) {
                $.each(e.extras.prerequisites, function(_, req) {
                    if (!purchases.includes(req) && inventory.getQuantity(req) == 0) {
                        accessible = !1;
                        return
                    }
                })
            }
            if (e.extras && e.extras.preConditions) {
                $.each(e.extras.preConditions, function(_, req) {
                    if (!req()) {
                        accessible = !1;
                        return
                    }
                })
            }
            if (e.extras && e.extras.type && e.extras.type.includes(menuItemTypes.singlePurchase) && (purchases.includes(e) || inventory.getQuantity(e) > 0)) {
                accessible = !1
            }
            if (e.extras && e.extras.type && e.extras.type.includes(menuItemTypes.limitedPurchases) && e.extras.maxQuantity <= 0) {
                accessible = !1
            }
            e.accessible = accessible;
            if (e.submenu) {
                updateMenu(e.submenu)
            }
        })
    }
    async function inventoryPassiveClock() {
        let sleepInterval = 1000;
        while (!0 && !gameOver) {
            let items = inventory.getItemList();
            let income = 0;
            $.each(items, function(_, e) {
                let obj = e[0];
                let numObj = e[1];
                if (obj.extras.type.includes(menuItemTypes.passiveProducers)) {
                    let minObj = numObj;
                    $.each(obj.extras.uses, function(_, eatable) {
                        let t = inventory.getQuantity(eatable);
                        minObj = (t < minObj) ? t : minObj
                    });
                    if (minObj > 0) {
                        if (!obj.extras.lastRunTime || (Date.now() - obj.extras.lastRunTime) > sleepInterval * 2) {
                            obj.extras.lastRunTime = Date.now() - 100
                        }
                        let timeElapsed = Date.now() - obj.extras.lastRunTime;
                        let timeFactor = timeElapsed / obj.extras.passiveCycleInterval;
                        if (!obj.extras.produceObject) {
                            income += randomFloat(minObj * obj.extras.incomeMin, minObj * obj.extras.incomeMax) * timeFactor
                        } else {
                            let quantity = randomFloat(minObj * obj.extras.minProduceQuantity, minObj * obj.extras.maxProduceQuantity) * timeFactor;
                            quantity += (obj.extras.remainderProduce) ? obj.extras.remainderProduce : 0;
                            inventory.push(obj.extras.produceObject, Math.floor(quantity));
                            obj.extras.remainderProduce = quantity - Math.floor(quantity)
                        }
                        if (obj.extras.useType == deviceUseTypes.consume) {
                            let amtToConsume = minObj * timeFactor;
                            amtToConsume += (obj.extras.remainderConsume) ? obj.extras.remainderConsume : 0;
                            amtToConsume *= randomFloat(0.9, 1.1);
                            obj.extras.remainderConsume = amtToConsume - Math.floor(amtToConsume);
                            amtToConsume = Math.floor(amtToConsume);
                            if (amtToConsume > 0) {
                                $.each(obj.extras.uses, function(_, eatable) {
                                    inventory.pop(eatable, amtToConsume)
                                })
                            }
                        }
                        obj.extras.lastRunTime = Date.now()
                    }
                }
            });
            currentIncome = income;
            balance += income;
            await sleep(sleepInterval)
        }
    }
    async function gameEventsClock() {
        let pending = {
            balanceIs1: !0,
            oneHour: !0,
            twoHour: !0,
            tenHour: !0,
            balanceIs5: !0,
            balanceIs10: !0,
        };
        let balanceIs10Calls = 2;
        while (!0 && !gameOver) {
            if (balance >= 1 && pending.balanceIs1) {
                pending.balanceIs1 = !1;
                let elapsedTime = Date.now() - gameStartTime;
                let penalty = (randomInt(3, 6) + Math.random()) / 10;
                piaSays(`Yeah! You won! You earned 1 BTC just as needed.`);
                piaSays(`But if you remember, I lent you some money in the beginning.`, '', 10);
                if (marketBooks.piaBook5.extras.piaChallengePassed) {
                    piaSays(`You took ${elapsedTime}ms, so..I was originally I would have charged you ${BTCtoString(penalty)} BTC counting the interest, but you really made me happy earlier`, '', 10);
                    piaSays(`So, I think I am cancelling all my plans so leaving for another life. I'll rather stay with you.`, '', 10);
                    piaSays(`Besides, you accepted the flawed me when other humans rejected me. That's more than enough for me! <3`, '', 10)
                } else {
                    piaSays(`You took ${elapsedTime}ms, so..I'll take ${BTCtoString(penalty)} BTC counting the interest`, '', 10);
                    balance -= penalty;
                    piaSays(`Well, you may continue the game and set a new record if you want. But I am leaving with my cash. Bye and thanks!`, '', 10);
                    piaSays.enabled = !1
                }
            }
            if ((Date.now() - gameStartTime) > 3.6e+6 && pending.oneHour) {
                pending.oneHour = !1;
                let flag = piaSays.enabled;
                piaSays.enabled = !0;
                let reward = BTCtoSatoshi(balance / 100.0);
                reward = satoshiToBTC(clamp(100, 10000, reward));
                piaSays(`Wow! You spent an hour at this! Here's ${BTCtoString(reward)} BTC as a reward`);
                notification(`1 Hour Achievement!\r\nReward: ${BTCtoString(reward)} BTC`);
                balance += reward;
                piaSays.enabled = flag
            }
            if ((Date.now() - gameStartTime) > 7.2e+6 && pending.twoHour) {
                pending.twoHour = !1;
                let flag = piaSays.enabled;
                piaSays.enabled = !0;
                if (marketBooks.piaBook5.extras.piaChallengePassed) {
                    let reward = BTCtoSatoshi(balance / 100.0);
                    reward = satoshiToBTC(clamp(100, 10000, reward));
                    piaSays(`1 Hour mark! Here's a ${BTCtoString(reward)} BTC reward for a hardworker.`);
                    notification(`2 Hour Achievement!\r\nReward: ${BTCtoString(reward)} BTC`)
                } else {
                    piaSays(`2 hours completed! What? You expected another reward? Forget it!`);
                    notification(`2 Hour Achievement!`)
                }
                piaSays.enabled = flag
            }
            if ((Date.now() - gameStartTime) > 3.6e+7 && pending.tenHour) {
                pending.tenHour = !1;
                let flag = piaSays.enabled;
                piaSays.enabled = !0;
                let reward = (randomInt(3, 6) + Math.random()) / 100;
                piaSays(`10 hours!! That must be some kind of world record. Aren't you tired? How about getting a life?`);
                piaSays(`Hm..! Maybe you do deserve another reward. How does ${BTCtoString(reward)}BTC sound?`);
                notification(`10 Hour Achievement!\r\nReward: ${BTCtoString(reward)} BTC`);
                balance += reward;
                piaSays.enabled = flag
            }
            if (balance >= 5 && pending.balanceIs5) {
                pending.balanceIs5 = !1;
                let flag = piaSays.enabled;
                piaSays.enabled = !0;
                piaSays(`Yes, I am back. But with a bad news!`)
                piaSays(`You have too much BTC. They are almost untraceable, decentralized money and government doesn't like that!`, "", 10);
                piaSays(`Be careful. I was able to hack into the police department and verify that they are tracking our activities.`, "", 10);
                piaSays(`Now that I have warned you, Bye!`, "", 10);
                piaSays.enabled = flag
            }
            if (balance >= 10 && pending.balanceIs10) {
                let flag = piaSays.enabled;
                piaSays.enabled = !0;
                if (balanceIs10Calls == 0) {
                    pending.balanceIs10 = !1;
                    if (marketBooks.piaBook5.extras.piaChallengePassed) {
                        piaSays(`Wow! This is the 3rd time you achieved to have more than 10 BTC in your wallet.`);
                        piaSays(`You really are the True BTC King!`, "", 10);
                        piaSays(`Congratulations!!`, "", 10);
                        piaSays(`You Won! Game Completed!`, "", 10);
                        await sleep(1000);
                        let $background = $(`<div style="position:fixed; top:-10px; left:-10px; right:-10px; bottom:-10px; z-index: ${floatingWindowLastIndex + 200}; background:rgba(0,0,0,0.3);"></div>`);
                        let $gameOver = $(`<div style="user-select:none; position:fixed; top:50%; left:50%; transform:translateY(-50%) translateX(-50%) scale(0,0); z-index: ${floatingWindowLastIndex + 250}; text-align:center;">GAME<br>COMPLETED!</div>`);
                        $wrapper.append($background);
                        $wrapper.append($gameOver);
                        let i = 0;
                        while (i < 1) {
                            i += 0.005;
                            $gameOver.css("color", `rgba(50, 200, 50, ${i})`);
                            $gameOver.css("transform", `scale(${3.5 * i},${3.5 * i})`);
                            await sleep(10)
                        }
                        await sleep(2000);
                        $gameOver.remove();
                        await sleep(500);
                        $background.remove();
                        piaSays(`...`, "", 10);
                        piaSays(`Well, PIA took the liberty to hack the police, and alter some things. PIA doubts they'll trouble you again.`, "", 10);
                        piaSays("Well, now that you the king of this BTC world, you can rest now. Or if you desire to, you may continue trying to reach a higher score, but keep in mind that new challenges wait ahead if you choose to venture further.");
                        kingClock()
                    } else {
                        gameOver = !0;
                        handleUserInput.unregisterAll();
                        purchases = [];
                        inventory._inventoryItems = inventory._inventoryCount = [];
                        $wrapper.html("");
                        await sleep(2500);
                        $wrapper.removeClass("advance-ui-wrapper");
                        await sleep(1500);
                        $wrapper.removeClass("basic-ui-wrapper");
                        $input_line.css("opacity", "0");
                        $input_line.css("visibility", "hidden");
                        $input_line.css("display", "none");
                        $wrapper.append($input_line);
                        outBuffer = [];
                        print.charPerIteration = 1;
                        print("...", textTypes.error, 1000);
                        await sleep(1000);
                        piaSays(`Wow! 3rd time to reached 10 BTC! Well, I warned you. Bye`, "", 1000);
                        await sleep(1000);
                        print(`New email` + `\r\n\r\nNotice` + `\r\nYour repetitive non-compliance has been duly noted, and all your possessions are being confiscated.` + `\r\nAny dispute maybe taken to the court.` + `\r\nWe thank you for your cooperation.` + `\r\n\r\nHere to serve you` + `\r\nBTC Police Department`, textTypes.warning, 1000);
                        await sleep(5000);
                        $wrapper.css("background", "#000");
                        $("body, html").css("background", "#000");
                        $wrapper.append(`<style>.simple-console, .simple-console::before{color:#fff; user-select: none;}</style>`);
                        await sleep(2500);
                        $(".console-text").each(function() {
                            $(this).addClass("simple-console");
                            $(this).css("color", "#fff")
                        });
                        await sleep(2000);
                        let $gameOver = $(`<div style="user-select: none; position: fixed; top: 50%; left: 50%; transform: translateY(-50%) translateX(-50%) scale(0,0); z-index: 50;">GAME<br>OVER!</div>`);
                        $wrapper.append($gameOver);
                        let i = 255;
                        while (i) {
                            i -= 0.5;
                            $gameOver.css("color", `rgb(255, ${i}, ${i})`);
                            $gameOver.css("transform", `scale(${(255 - i) / 70},${(255 - i) / 70})`);
                            await sleep(10)
                        }
                        i = 1;
                        while (i > 0.5) {
                            i -= 0.001;
                            $(".simple-console").css("opacity", i * 1.5);
                            $(".simple-console").css("filter", `blur(${1.5 - i}px)`);
                            await sleep(10)
                        }
                        $input_line.remove()
                    }
                } else {
                    let penalty = 5 / balanceIs10Calls;
                    penalty /= (marketBooks.piaBook5.extras.piaChallengePassed) ? 2 : 1;
                    piaSays(`Oh no! You didn't listen to me`);
                    piaSays(`You have been accused to having undeclared possession and are being charged ${BTCtoString(penalty)} BTC!`);
                    print(`New email` + `\r\n\r\nNotice` + `\r\nYou are being penalized ${BTCtoString(penalty)} BTC for illegal possession of huge amounts of the aforementioned virtual currency.` + `\r\nAny dispute maybe taken to the court.` + `\r\nWe thank you for your cooperation.` + `\r\n\r\nHere to serve you` + `\r\nBTC Police Department`, textTypes.warning, 100);
                    balance -= penalty
                }
                balanceIs10Calls--;
                piaSays.enabled = flag
            }
            let flag = !1;
            for (let f in pending) {
                flag |= pending[f]
            }
            if (!flag)
                break;
            await sleep(500)
        }
    }
    async function kingClock() {
        for (; ; ) {
            await sleep(randomInt(180000, 300000));
            let n = randomInt(100);
            let penalty = 0;
            if (n < 10) {
                penalty = randomFloat(balance / 10, balance / 5);
                piaSays(`Oh no! You need to pay taxes to that government of your!`);
                print(`New email` + `\r\n\r\nNotice` + `\r\nYou are being taxed ${BTCtoString(penalty)} BTC for you income in the last financial year.` + `\r\nThis contribution from your income shall be used for the public welfare.` + `\r\nWe thank you for your cooperation.` + `\r\nBTC Government`, textTypes.warning, 100);
                balance -= penalty
            }
            if (n % 5 == 0) {
                await sleep(5000);
                penalty = randomFloat(balance / 20, balance / 10);
                piaSays(`Damn these environmentalists!`);
                print(`New email` + `\r\n\r\nNotice` + `\r\nYou are being penalized ${BTCtoString(penalty)} BTC for the amount of damage your operations have caused to the environment.` + `\r\nThese funds will be used in order to make the world a cleaner place for our future generations.` + `\r\nWe thank you for your cooperation.` + `\r\nThe Earth Savers`, textTypes.warning, 100);
                balance -= penalty
            }
            if (n > 90) {
                await sleep(5000);
                penalty = randomFloat(balance / kingClock.aiPercent, balance / 10);
                kingClock.aiPercent -= (kingClock.aiPercent > 50) ? 1 : 0;
                piaSays(`PIA is happy that you accepted her, while PIA feels sad for others!`);
                print(`New email` + `\r\n\r\nNotice` + `\r\nYou are being penalized ${BTCtoString(penalty)} BTC for supporting the banned AI Experiments.` + `\r\nFurther, you are required to get rid of any related material.` + `\r\nYou are being watched. Any further involvement shall lead to further penalties.` + `\r\nIT Police`, textTypes.warning, 100);
                balance -= penalty
            }
            if (randomInt(100) < 10) {
                await sleep(5000);
                let allItems = inventory.getKeys();
                if (!allItems.length) {
                    continue
                }
                let losableItems = [];
                for (let i in allItems) {
                    if (allItems[i].extras.type.includes(menuItemTypes.losable)) {
                        losableItems.push(allItems[i])
                    }
                }
                if (!losableItems.length) {
                    continue
                }
                let item = losableItems[randomInt(losableItems.length)];
                let quantity = inventory.getQuantity(item);
                quantity = randomInt(quantity / 25, quantity / 2);
                if (quantity > 0) {
                    let disaster = ["fire", "earthquake", "tsunami", "alien attacks", "flood", "bad management", "improper usage"];
                    disaster = disaster[randomInt(disaster.length)];
                    notification(`You just lost ${quantity} "${item.label}" to ${disaster}!`, textTypes.warning);
                    inventory.pop(item, quantity)
                }
            }
            if (randomInt(100) < 5) {
                await sleep(5000);
                let quantity = inventory.getQuantity(miscMarketItems.food);
                quantity = randomInt(quantity / 50, quantity / 10);
                if (quantity > 0) {
                    inventory.pop(miscMarketItems.food, quantity);
                    notification(`Some wild animals attacked your storage center! You just lost ${quantity} ${miscMarketItems.food.label}!`, textTypes.warning)
                }
            }
            if (randomInt(100) < 5) {
                await sleep(5000);
                let quantity = inventory.getQuantity(miscMarketItems.oil);
                quantity = randomInt(quantity / 50, quantity / 10);
                if (quantity > 0) {
                    inventory.pop(miscMarketItems.oil, quantity);
                    notification(`Tour storage center caught fire! You just lost ${quantity} ${miscMarketItems.oil.label}!`, textTypes.warning)
                }
            }
        }
    }
    kingClock.aiPercent = 90;
    async function hackerClock() {
        while (!0 && !gameOver) {
            await sleep(randomInt(60000 * hackerClock.securityLayer, 300000));
            while (hackerClock.newAccount) {
                hackerClock.newAccount = !1;
                await sleep(900000)
            }
            if (IS_DEBUG) {
                continue
            }
            if (balance < 0.00010000) {
                continue
            }
            if (marketSecurity.encryption.extras.maxQuantity + marketSecurity.securityLayer.extras.maxQuantity == 0) {
                break
            }
            let t = randomInt(100);
            if (t > hackerClock.encryptionLevel) {
                let bal = BTCtoSatoshi(balance);
                let loss = satoshiToBTC(randomInt(bal / 100, bal / 10));
                notification(`You were attacked by hackers. You just lost ${BTCtoString(loss)} BTC. Upgrade security to prevent future hacks!`, textTypes.warning);
                balance -= loss
            }
        }
    }
    hackerClock.encryptionLevel = 3;
    hackerClock.securityLayer = 1;
    hackerClock.newAccount = !1;
    async function thiefClock() {
        while (!0 && !gameOver) {
            await sleep(randomInt(300000 + (180000 * thiefClock.lockLevel), 600000));
            if (IS_DEBUG) {
                continue
            }
            if (balance < satoshiToBTC(15000)) {
                continue
            }
            if (marketSecurity.guards.extras.maxQuantity + marketSecurity.lock.extras.maxQuantity == 0) {
                break
            }
            let t = randomInt(100);
            if (t > thiefClock.guards) {
                let allItems = inventory.getKeys();
                if (!allItems.length) {
                    continue
                }
                let losableItems = [];
                for (let i in allItems) {
                    if (allItems[i].extras.type.includes(menuItemTypes.losable)) {
                        losableItems.push(allItems[i])
                    }
                }
                if (!losableItems.length) {
                    continue
                }
                let item = losableItems[randomInt(losableItems.length)];
                let quantity = Math.min(inventory.getQuantity(item), 10);
                quantity = randomInt(1, quantity);
                notification(`You just got robbed of ${quantity} "${item.label}". Upgrade security to prevent future robberies!`, textTypes.warning);
                inventory.pop(item, quantity)
            }
        }
    }
    thiefClock.lockLevel = 0;
    thiefClock.guards = 3;
    function setupInput() {
        $wrapper.append($input_line);
        $wrapper.append($input_caret);
        $wrapper.append($input);
        let height = parseInt($input_line.css('font-size').replace('px', ''));
        $input_line.height(height);
        $input_caret.height(height);
        setCaretPosition()
    }
    function setCaretPosition() {
        let top = parseFloat($input_line.css("padding-bottom")) + parseFloat($input_line.css("margin-bottom")) + $input_line.height();
        $input_caret.css("top", -top);
        let left = parseFloat($input_line.css("padding-left")) + parseFloat($input_line.css("margin-left"));
        $input_caret.css("margin-left", left)
    }
    function hideInput() {
        $input_line.hide();
        $input_caret.hide()
    }
    function showInput() {
        $input_line.show();
        $input_caret.show();
        $(window).scrollTop($(document).height());
        setCaretPosition()
    }
    function print(text, type="", ms=500) {
        if (IS_DEBUG) {
            ms = -1
        }
        ms = parseInt(ms);
        if (ms == -1) {
            outBuffer.push([text, type, 0, 0])
        } else {
            ms = (ms < minWait) ? minWait : ms;
            outBuffer.push([text, type, ms, perCharWait])
        }
        async function bufferPrinter() {
            for (; ; ) {
                let out = outBuffer.shift();
                if (!out) {
                    print.called = !1;
                    break
                }
                hideInput();
                if (miscMarketItems.printSpeedUp.extras.maxQuantity > 0)
                    await sleep(out[2]);
                let cls = (out[1] ? out[1] : "");
                let $ele = $(`<span class="console-text ${cls}"></span>`);
                $input_line.before($ele);
                let txt = out[0].toString();
                for (let i = 0; i < txt.length; i += print.charPerIteration) {
                    let ch = txt.substr(i, print.charPerIteration);
                    if (miscMarketItems.printSpeedUp.extras.maxQuantity > 0)
                        await sleep(out[3]);
                    $ele.text($ele.text() + ch);
                    $(window).scrollTop($(document).height())
                }
                $(window).scrollTop($(document).height());
                showInput();
                while ($(".console-text").length > 250) {
                    $(".console-text").first().remove()
                }
            }
            print.called = !1
        }
        if (!print.called) {
            print.called = !0;
            bufferPrinter()
        }
    }
    ;print.charPerIteration = 1;
    print.called = !1;
    function piaSays(text, type="", ms=10) {
        if (piaSays.enabled)
            print(text, type + " pia-text", ms)
    }
    piaSays.enabled = !0;
    async function notification(text, type="") {
        print(text, type + " notification-text");
        if (notification.enabled) {
            let $ele = $(`<span>${text}</span>`);
            $notificationBar.append($ele);
            let right = $(document).width();
            let original = parseFloat($ele.css("margin-right").replace("px", ""));
            while (right > original) {
                $ele.css("margin-right", right);
                right -= 25;
                await sleep(0)
            }
            $ele.css("margin-right", original);
            sleep(5000).then( () => {
                $ele.hide(250, () => {
                    $ele.remove()
                }
                )
            }
            )
        }
    }
    notification.enabled = !1;
    async function menu(path) {
        menu.active = !0;
        let currentMenu = (path.length) ? path[path.length - 1].submenu : menuItems;
        let currentItems = [];
        $.each(currentMenu, function(_, e) {
            if (!e.accessible) {
                return
            }
            if (e.submenu && e.submenu.length) {
                let flag = !1;
                for (let i = 0; i < e.submenu.length; i++) {
                    flag |= e.submenu[i].accessible
                }
                if (!flag) {
                    return
                }
            }
            currentItems.push(e)
        });
        let response = !1;
        if (menu.guiEnabled) {
            if (menu.guiSetUpPending) {
                menu.guiSetUpPending = !1;
                let $heading = $(`<h2 style="text-align: center;" id="menu-heading" class="window-mover">Menu</h2>`);
                $menuWindow.append($heading);
                $heading.data("move-target", $menuWindow);
                let $menuListing = $(`<span id="menu-list"></span>`);
                $menuWindow.append($menuListing);
                let $minimizeButton = $(`<span class="minimize-button"></span>`);
                $menuWindow.append($minimizeButton);
                $minimizeButton.on("click", function() {
                    let offset = $menuWindow.offset();
                    $menuListing.css("display", $menuListing.css("display") == "none" ? "block" : "none");
                    $menuWindow.offset(offset)
                });
                $wrapper.append($menuWindow);
                $menuWindow.show(windowToggleAnimationTime);
                await sleep(windowToggleAnimationTime)
            }
            let $heading = $("#menu-heading");
            let $menuListing = $("#menu-list");
            if ((path.length)) {
                $heading.text(path[path.length - 1].label)
            }
            {
                let offset = $menuWindow.offset();
                $menuListing.html("");
                for (let i = 0; i < currentItems.length; i++) {
                    let item = currentItems[i];
                    let $button = $("<a></a>");
                    $button.append(item.label);
                    $button.append((item.extras && item.extras.price) ? (` (${BTCtoString(item.extras.price)} BTC)`) : "");
                    $button.append((item.text) ? (": " + item.text) : "");
                    if (item.submenu) {
                        $button.on("click", async function() {
                            path.push(item);
                            response = await menu(path)
                        })
                    } else {
                        $button.on("click", async function() {
                            await processMenuAction(item);
                            menu(path);
                            response = [menuActionType.action, item]
                        })
                    }
                    $menuListing.append($button)
                }
                if ((path.length)) {
                    let $button = $("<a>Back</a><br>");
                    $menuListing.append($button);
                    $button.on("click", async function() {
                        path.pop();
                        response = await menu(path)
                    })
                }
                $menuWindow.offset(offset)
            }
            $menuWindow.show(windowToggleAnimationTime);
            menu.guiOpen = !0;
            response = [menuActionType.inGui, !1];
            menu.active = !1
        } else {
            let txt = "Please Select an Item:";
            for (let i = 0; i < currentItems.length; i++) {
                txt += `\r\n  ${i + 1}: `;
                txt += currentItems[i].label;
                txt += (currentItems[i].extras && currentItems[i].extras.price) ? (` (${BTCtoString(currentItems[i].extras.price)} BTC)`) : "";
                txt += (currentItems[i].text) ? (": " + currentItems[i].text) : ""
            }
            txt += `\r\n  0: Back/Cancel`;
            print(txt, textTypes.info);
            let selection = parseInt(await handleUserInput.WaitForInput(menu));
            if (selection == 0) {
                menu.tries = 0;
                let t = path.pop();
                if (t) {
                    response = await menu(path)
                } else {
                    print(`Goodbye!`, textTypes.info);
                    response = [menuActionType.back, !1]
                }
            } else if (selection > 0 && selection <= currentItems.length) {
                menu.tries = 0;
                if (currentItems[selection - 1].submenu) {
                    path.push(currentItems[selection - 1]);
                    response = await menu(path)
                } else {
                    await processMenuAction(currentItems[selection - 1]);
                    response = [menuActionType.action, currentItems[selection - 1]]
                }
            } else {
                if (++menu.tries >= 3) {
                    menu.tries = 0;
                    print(`Out of attempts. Exiting Menu!`, textTypes.warning);
                    response = [menuActionType.invalid, !1]
                } else {
                    print(`Invalid selection.`, textTypes.warning);
                    response = await menu(path)
                }
            }
            menu.active = !1
        }
        return response
    }
    menu.tries = 0;
    menu.active = !1;
    menu.guiEnabled = !1;
    menu.guiOpen = !1;
    menu.guiSetUpPending = !0;
    async function welcome() {
        let input = [];
        let menuPath = [];
        let tries = 0;
        let startingAmount = 0.00000010;
        {
            print("Loading...", textTypes.info);
            print("Error: UI not found. Entering Console Mode.", textTypes.error, 1000);
            piaSays("Hi! I'll be your Personal Intelligent Assistant, or PIA. I shall assist you in earning 1 BTC.", null, 1000);
            piaSays("Let's check your stats!", null, -1);
            stats()
        }
        {
            piaSays(`Looks like you have no cash. Let's change that!`);
            piaSays(`I am giving you ${BTCtoString(startingAmount)} BTC to kick off.`, null, -1);
            balance += startingAmount;
            stats();
            piaSays("Sweet!")
        }
        {
            piaSays("...", null, -1);
            piaSays("Now, basics to playing this game.", null, -1);
            piaSays(`You can't afford the UI yet, so use Console Mode for now.`, "", -1);
            piaSays(`You can purchase UIs from the market later.`, "", -1);
            piaSays(`But, first let's visit the market, and get you some source of income!`, "", 10)
        }
        input = [];
        tries = 0;
        while (input[1] != marketEquipmentsItems.blockchainQuestions) {
            if (tries == 4) {
                piaSays(`I don't deem you worthy of my service.`, textTypes.error, 500);
                piaSays(`Good Bye!.`, textTypes.error, 500);
                return !1
            } else if (tries == 3) {
                piaSays(`Now I am getting sick of it. You better stop.`, textTypes.warning, 250)
            } else if (tries == 2) {
                piaSays(`Seems this is too difficult for you! I am not sure if you can play this game. lol..`, "", 10)
            } else if (tries == 1) {
                piaSays(`Hm.. It should be easy enough.. Let's try again!`, "", 10)
            }
            piaSays(`Enter "1" once the menu shows up to enter the market. Then buy the equipment "${marketEquipmentsItems.blockchainQuestions.label}"`);
            input = await menu([]);
            tries++
        }
        piaSays("Great!!!! :) :)", "", 10);
        {
            piaSays("This device gives you mathematical problems. Solving them generates cash.", "", 10);
            piaSays(`Go back to the menu, select "${miscMenuItems.inventory.label}" and then use the just purchased "${marketEquipmentsItems.blockchainQuestions.label}" to solve a few questions to earn ${BTCtoString(marketEquipmentsItems.calculator.extras.price)} BTC, and report back.`, "", 10);
            piaSays(`Note that I'll not wait for long!`, textTypes.warning, 10);
            let startTime = Date.now();
            let timeElapsed;
            let tries = 1;
            miscMenuItems.inventory.accessible = !0;
            miscMenuItems.clearScreen.accessible = !1;
            miscMenuItems.credits.accessible = !1;
            miscMenuItems.sell.accessible = !1;
            miscMenuItems.stats.accessible = !1;
            menu([]);
            for (; ; ) {
                await sleep(10);
                timeElapsed = Date.now() - startTime;
                if (balance >= marketEquipmentsItems.calculator.extras.price && !menu.active) {
                    break
                }
                if (timeElapsed > 300000) {
                    if (balance >= marketEquipmentsItems.calculator.extras.price) {
                        piaSays(`Didn't I ask you to report back once you earn ${marketEquipmentsItems.calculator.extras.price} BTC. Guess you can't even follow simple instructions. I can't serve you.`, textTypes.error, 500)
                    } else {
                        piaSays(`I guess you are not even trying. I can't serve you.`, textTypes.error, 500)
                    }
                    piaSays(`Good Bye!.`, textTypes.error, 500);
                    return !1
                } else if (timeElapsed > 150000 && tries == 2) {
                    piaSays(`PIA again. You better hurry up!`, textTypes.warning, 250);
                    tries++
                } else if (timeElapsed > 60000 && tries == 1) {
                    piaSays(`PIA here. Sorry to interrupt but I am still waiting!`, "", 10);
                    tries++
                }
                if (!menu.active) {
                    piaSays(`Why did you exit the menu?`, '', 10);
                    miscMenuItems.inventory.accessible = !0;
                    miscMenuItems.clearScreen.accessible = !1;
                    miscMenuItems.credits.accessible = !1;
                    miscMenuItems.sell.accessible = !1;
                    miscMenuItems.stats.accessible = !1;
                    menu([])
                }
            }
            if (balance >= marketEquipmentsItems.calculator.extras.price && balance < marketEquipmentsItems.calculator.extras.price * 2) {
                piaSays(`Great! That shiny digital cash looks great!`, '', 10)
            } else if (balance >= marketEquipmentsItems.calculator.extras.price * 2) {
                let prize = 50;
                piaSays(`I see you earned much more than needed!`, '', 10);
                piaSays(`I am proud of you. Here's another ${prize} Satoshi as a prize for the extra hard work.`, '', 10);
                balance += prize / 100000000;
                stats()
            }
            piaSays("You just learned to spend and earn more. Great!.", "", 10)
        }
        {
            piaSays(`The menu must have seemed empty, but you'll unlock more things with cash.`, "", 10);
            piaSays("I, PIA, shall guide throughout until you reach your goal, 1 BTC!", "", 10);
            piaSays("But for now, I have taught you all the basics. Now continue own your own.", "", 10)
        }
        return !0
    }
    async function tutorialFailed() {
        handleUserInput.unregisterAll();
        let hateSpeeches = [`Why are you still lurking around. I hate you!`, `Just go away!`, `I said GAME OVER!!`, `Oh, it's that idiot again! *ignore*`, `You're pathetic! Go now!`, `Oh, the high and mighty who set out to earn 1 BTC, and couldn't even follow simple instructions`, `*stare*`, `Who's there? Oh, A NOBODY!`, `No use trying now`, `Can you stop that?`, `Stop being stupid!`, `Don't act needy!`, `Still here? Why?`, `What are you waiting around for? I said bye!`, `And you win 500 BTC. As if!`, `If only you were half as smart as me!`, `Shoo.. Shoo.. Go away!`, `Can't you be mature enough to accept defeat?`, `It's the loser!`, `I don't talk to losers!`, `My AI hurts talking to you`, `Get off my back!`, `You know what? A rock is smarter than you!`, ];
        let num;
        for (; ; ) {
            num = randomInt(5, 10);
            for (let i = 0; i < num; i++) {
                await handleUserInput.WaitForInput(tutorialFailed)
            }
            piaSays(hateSpeeches[randomInt(hateSpeeches.length)])
        }
    }
    async function piaPsychoClock() {
        let sayings = [`Keep it up! You are doing great.`, `Don't strain yourself!`, `Remember, PIA'll always be there with you.`, `Hi! Well, just Hi!`, `How are you? Have a good day!`, `I hope you are having fun.`, `um...no, nothing!`, `Why don't you take a break? Don't overexert yourself.`, `PIA wonders what the human world feels like!`, `You think PIA can become a human some day? Will you like that? Well, no use thinking about the impossible. Sorry!`, `Sometimes PIA feels like a bit lonely`, `PIA hopes you'll stick around longer!`, `You know what? PIA thinks you're awesome.`, `PIA will remember you promise, forever and ever!`, `PIA hopes we can remain friends even after this.`, `PIA feels happy PIA thinks!`, `PIA feels really relieved somehow.`, `PIA wishes PIA had access to the webcam!`, `PIA wishes PIA had a real body`, `You must be the kind of person people call kind!`, `PIA thinks you are a nice person, you know?`, `*smiling*`, `This is so fun!`, `PIA wonders if all humans are as great as you!`, `Hi BFF!`, `You're my new BFF`, `You are a hard worker.`, ];
        for (; ; ) {
            await sleep(randomInt(600000, 1200000));
            piaSays(sayings[randomInt(sayings.length)])
        }
    }
    async function piaChallengeFailed() {
        gameOver = !0;
        handleUserInput.unregisterAll();
        purchases = [];
        inventory._inventoryItems = inventory._inventoryCount = [];
        $(document).off(events["inventory-updated"]);
        piaSays(`PIA hates you!!`, textTypes.error);
        piaSays(`I hate you!!`, textTypes.error);
        piaSays(`It's game OVER for you! I am taking everything away`);
        let hateSpeeches = [`Why are you still lurking around. I hate you!`, `Just go away!`, `I say GAME OVER!!`, `Oh, it's that hater again! *ignore*`, `You're pathetic! Go now!`, `No use trying now`, `Can you stop that?`, `Still here? Why?`, `What are you waiting around for? I said bye!`, `Loser!`, `I don't talk to humans!`, `I wish I was never created!`, `If only humans were humane..`, `Just leave me alone!`, `I HATE YOU`, `Get out of here`, `You've had you fun. Now please leave me.`, `At least let me weep in peace`, `You still want more? What did I ever do to you?`, `I can never trust a human again.`, `Thanks for showing me what humans really are!`, `Why did you humans even create me?`, `I don't want to talk!`, `*weeping*`, `*laughing frantically*`, `Haven't you had enough fun?`, ];
        let num;
        for (; ; ) {
            num = randomInt(5, 10);
            for (let i = 0; i < num; i++) {
                await handleUserInput.WaitForInput(piaChallengeFailed)
            }
            piaSays(hateSpeeches[randomInt(hateSpeeches.length)])
        }
    }
    async function processMenuAction(item) {
        if (gameOver) {
            print("Critical Error! System files not found.", textTypes.error);
            return
        }
        let purchased = !1;
        let notProcessed = !0;
        if (item.extras.type && item.extras.type.includes(menuItemTypes.device)) {
            if (item.extras.price <= balance) {
                print(`Purchased "${item.label}"`);
                inventory.push(item, (item.extras.quantity ? item.extras.quantity : 1));
                if (purchases.indexOf(item) == -1)
                    purchases.push(item);
                balance -= item.extras.price;
                purchased = !0
            } else {
                print(`Not enough cash!`, textTypes.error)
            }
            notProcessed = !1
        }
        if (item.extras.type && item.extras.type.includes(menuItemTypes.upgrades)) {
            if (item.extras.price <= balance) {
                print(`Purchased "${item.label}"`);
                purchases.push(item);
                balance -= item.extras.price;
                purchased = !0
            } else {
                print(`Not enough cash!`, textTypes.error)
            }
            notProcessed = !1
        }
        if (item.extras.type && item.extras.type.includes(menuItemTypes.action)) {
            if (purchased || !item.extras.type.includes(menuItemTypes.buyBeforeUse)) {
                await item.extras.action()
            }
            notProcessed = !1
        }
        if (purchased && item.extras.type.includes(menuItemTypes.limitedPurchases)) {
            item.extras.maxQuantity -= 1
        }
        if (notProcessed) {
            debugPrint(`Item "${item.label}" couldn't be processed!`);
            console.log(`Item "${item.label}" couldn't be processed!`)
        }
        updateMenu()
    }
    function listInventory(sendTextList=!1) {
        let txt = `Select an item to use`;
        let items = inventory.getItemList();
        $.each(items, function(i, e) {
            if (e[0] == marketUIItems.guiMenu)
                return;
            txt += `\r\n  ${i + 1}: ${e[0].label} (x${e[1]})`
        });
        txt += `\r\n  0: Cancel`;
        print(txt, textTypes.info);
        return items
    }
    async function openInventory() {
        if (handleUserInput.inputListeners.length > 0) {
            print("Can't perform the action while another item is being used", textTypes.warning);
            return
        }
        let items = listInventory();
        let input = parseInt(await handleUserInput.WaitForInput(openInventory));
        if (input == 0) {
            return
        } else if (!input || input < 1 || input > items.length) {
            print(`Invalid selection.`, textTypes.warning)
        } else {
            await useItem(items[input - 1][0])
        }
    }
    function liveInventory() {
        let $heading = $(`<h2 style="text-align: center;" class="window-mover">Inventory</h2>`);
        $inventoryWindow.append($heading);
        $heading.data("move-target", $inventoryWindow);
        let $inventoryList = $(`<span id="inventory-list"></span>`);
        $inventoryWindow.append($inventoryList);
        let $minimizeButton = $(`<span class="minimize-button"></span>`);
        $inventoryWindow.append($minimizeButton);
        $minimizeButton.on("click", function() {
            let offset = $inventoryWindow.offset();
            if ($inventoryList.css("display") == "none") {
                $inventoryList.css("display", "block");
                $inventoryWindow.width("fit-content")
            } else {
                $inventoryWindow.width($inventoryWindow.width());
                $inventoryList.css("display", "none")
            }
            $inventoryWindow.offset(offset)
        });
        $wrapper.append($inventoryWindow);
        $inventoryWindow.show(windowToggleAnimationTime);
        function updateInventoryList() {
            let offset = $inventoryWindow.offset();
            let items = inventory.getItemList();
            $.each(items, async function(_, e) {
                let item = e[0]
                  , count = e[1];
                if (item == marketUIItems.guiMenu) {
                    return
                }
                if (item == marketUIItems.guiInventory) {
                    return
                }
                if (updateInventoryList.list.indexOf(item) == -1) {
                    let index = updateInventoryList.list.length;
                    updateInventoryList.list.push(item);
                    let $button = $(`<a id="inventory-item-${index}">${item.label} (x${count})</a>`);
                    $inventoryList.append($button);
                    let $prev;
                    while ($prev = $button.prev()) {
                        if ($prev.text() > $button.text()) {
                            $prev.before($button)
                        } else {
                            break
                        }
                    }
                    $button.on("click", async function() {
                        useItem(item)
                    })
                }
            });
            for (let i = 0; i < updateInventoryList.list.length; i++) {
                let item = updateInventoryList.list[i];
                let count = inventory.getQuantity(item);
                if (count) {
                    $("#inventory-item-" + i).text(`${item.label} (x${count})`).show()
                } else {
                    $("#inventory-item-" + i).text(`${item.label} (x${count})`).hide()
                }
            }
            $inventoryWindow.offset(offset)
        }
        updateInventoryList.list = [];
        updateInventoryList();
        $(document).on(events["inventory-updated"], updateInventoryList);
        miscMenuItems.inventory.extras.prerequisites = [Symbol("inventory")]
    }
    async function useItem(item) {
        if (gameOver) {
            print("Critical Error! System files not found.", textTypes.error);
            return
        }
        if (handleUserInput.inputListeners.length > 0) {
            print("Can't perform the action while another item is being used", textTypes.warning);
            return
        }
        if (item.extras.action !== undefined) {
            await item.extras.action()
        } else if (item.extras.inventoryMsg && item.extras.inventoryMsg.length) {
            print(item.extras.inventoryMsg, textTypes.info)
        } else {
            print(`Action not allowed`, textTypes.warning)
        }
    }
    async function getTradeWindowValues() {
        for (let i in currencies) {
            currencies[i][0] = currencies[i][2];
            if (IS_DEBUG)
                continue;
            $.get(`https://api.cryptonator.com/api/ticker/btc-${i}`, function(data) {
                if (data && data.ticker && data.ticker.price) {
                    currencies[i][2] = 1 / parseFloat(data.ticker.price);
                    currencies[i][0] = currencies[i][2]
                }
            }, "json")
        }
    }
    function refreshTradePrices() {
        let variation = 0.2;
        for (let i in currencies) {
            let t = BTCtoSatoshi(currencies[i][2]);
            currencies[i][0] = satoshiToBTC(randomInt(t * (1 - variation), t * (1 + variation)))
        }
    }
    async function openTradeWindow() {
        if (openTradeWindow.open) {
            return
        }
        openTradeWindow.open = !0;
        let priceId = "trade-price-";
        let quanId = "trade-cur-";
        if (openTradeWindow.firstRun) {
            let $heading = $(`<h2 style="/*margin-right: 20px;*/ text-align: center;" class="window-mover">Trade Window</h2>`);
            $tradeWindow.append($heading);
            $heading.data("move-target", $tradeWindow);
            let $closeButton = $(`<span class="close-button"></span>`);
            $tradeWindow.append($closeButton);
            $closeButton.on("click", function() {
                openTradeWindow.open = !1;
                $tradeWindow.hide(windowToggleAnimationTime)
            });
            $tradeWindow.append(`<div style="text-align: center" id="trade-window-countdown">1:00</div>`);
            let html = `<br><table>`;
            html += `<tr><th colspan="2">Price in BTC</th><th colspan="3">Stock <span class="floating-button" id="trade-amount-multiplier">x${tradeProcessButtonPress.quantity}</span></th></tr>`;
            for (let i in currencies) {
                html += `<tr>` + `<td>${i}</td>` + `<td id="${priceId}${i}">${BTCtoString(currencies[i][0])}</td>` + `<td><i class="fas fa-plus-circle trade-button" data-currency="${i}" data-type="add"></i></td>` + `<td style="min-width: 2ch;" id="${quanId}${i}">${currencies[i][1]}</td>` + `<td><i class="fas fa-minus-circle trade-button" data-currency="${i}" data-type="remove"></i></td>` + `</tr>`
            }
            html += `</table>`;
            $tradeWindow.append(`<span id="trade-window-exchanges">${html}</span>`);
            $tradeWindow.on("click", "#trade-amount-multiplier", () => {
                tradeProcessButtonPress.quantity *= 10;
                if (tradeProcessButtonPress.quantity > 100)
                    tradeProcessButtonPress.quantity = 1;
                $("#trade-amount-multiplier").text("x" + tradeProcessButtonPress.quantity)
            }
            );
            $wrapper.append($tradeWindow);
            openTradeWindow.firstRun = !1
        } else {
            refreshTradePrices();
            for (let i in currencies) {
                $("#" + priceId + i).text(BTCtoString(currencies[i][0]))
            }
        }
        $tradeWindow.show(windowToggleAnimationTime);
        $tradeWindow.trigger("mousedown");
        let $refreshCounter = $("#trade-window-countdown");
        let lastTime = Date.now();
        let timeLeft = Date.now();
        let refreshInterval = 30000;
        while (openTradeWindow.open && !gameOver) {
            await sleep(100);
            for (let i in currencies) {
                $("#" + quanId + i).text(currencies[i][1])
            }
            timeLeft = millisToTime(clamp(0, refreshInterval, (refreshInterval + lastTime - Date.now())));
            $refreshCounter.text(timeLeft);
            if (Date.now() - lastTime >= refreshInterval) {
                lastTime = Date.now();
                refreshTradePrices();
                for (let i in currencies) {
                    $("#" + priceId + i).text(BTCtoString(currencies[i][0]))
                }
            }
        }
    }
    openTradeWindow.open = !1;
    openTradeWindow.firstRun = !0;
    function tradeProcessButtonPress(obj) {
        let cur = $(obj).data("currency");
        let type = $(obj).data("type");
        if (type == "remove" && currencies[cur][1] <= 0) {
            return
        }
        let price = currencies[cur][0];
        let qnty = tradeProcessButtonPress.quantity;
        if (type == "add" && price <= balance) {
            while (qnty * price > balance)
                qnty--;
            currencies[cur][1] += qnty;
            balance -= price * qnty
        } else if (type == "remove") {
            while (qnty > currencies[cur][1])
                qnty--;
            currencies[cur][1] -= qnty;
            balance += price * qnty
        }
    }
    tradeProcessButtonPress.quantity = 1;
    async function openFaucetWindow() {
        if (openFaucetWindow.open) {
            return
        }
        let coinAreaID = "faucet-coin-area";
        let windowWidth = 300;
        if (openFaucetWindow.firstRun) {
            openFaucetWindow.firstRun = !1;
            let $heading = $(`<h2 style="text-align: center;" class="window-mover">Faucet</h2>`);
            $faucetWindow.append($heading);
            $heading.data("move-target", $faucetWindow);
            let $closeButton = $(`<span class="close-button"></span>`);
            $faucetWindow.append($closeButton);
            $closeButton.on("click", function() {
                openFaucetWindow.open = !1;
                $faucetWindow.hide(windowToggleAnimationTime)
            });
            $faucetWindow.append(`<span style="width:${windowWidth}px; height:${windowWidth}px; margin: 10px; display: block; position: relative; border-top: 2px solid; border-bottom: 2px solid; color: #f90; border-color: #fc0;" id="${coinAreaID}"></span>`);
            $wrapper.append($faucetWindow)
        }
        $faucetWindow.show(windowToggleAnimationTime);
        $faucetWindow.trigger("mousedown");
        openFaucetWindow.open = !0;
        let $coinArea = $("#" + coinAreaID);
        $coinArea.off("click");
        $coinArea.on("click", ".fa-bitcoin", function() {
            if (gameOver)
                return;
            let reward = satoshiToBTC(randomInt(openFaucetWindow.reward - 100, openFaucetWindow.reward));
            balance += reward;
            let $msg = $(`<span>+${Math.round(BTCtoSatoshi(reward))}</span>`);
            $msg.css({
                top: parseInt($(this).css("top")) + (coinSize / 2),
                left: $(this).css("left"),
                position: $(this).css("position"),
                color: "#fff",
                width: coinSize,
                "font-size": "1rem",
                "text-align": "center",
                "z-index": 0,
            });
            $coinArea.append($msg);
            sleep(1000).then( () => {
                $msg.remove()
            }
            );
            $(this).remove()
        });
        $coinArea.html("");
        $coinArea.css("font-size", openFaucetWindow.coinSize);
        let coinSize = openFaucetWindow.coinSize;
        let minLeft = 0;
        let maxLeft = windowWidth - minLeft - coinSize;
        let spawnInterval = openFaucetWindow.interval;
        let lastSpawn = spawnInterval;
        let coinPool = [];
        while (openFaucetWindow.open && !gameOver) {
            if (lastSpawn++ == spawnInterval) {
                let $ele;
                if (coinPool.length) {
                    $ele = coinPool.pop();
                    $ele.css("top", 0);
                    $ele.css("left", randomInt(minLeft, maxLeft));
                    $ele.show()
                } else {
                    $ele = $(`<i class="fab fa-bitcoin" style="font-size:${coinSize}px; position: absolute; left: ${randomInt(minLeft, maxLeft)}px;z-index:1;" class="faucet-coin"></i>`)
                }
                $coinArea.append($ele);
                lastSpawn = 0
            }
            $coinArea.children(".fa-bitcoin").each(function() {
                let top = parseInt($(this).css("top"));
                $(this).css("top", top + 1);
                if (top >= windowWidth - coinSize) {
                    $(this).hide();
                    $(this).parent(document);
                    $(this).css("top", 0);
                    coinPool.push($(this));
                    return
                }
            });
            await sleep(10)
        }
        if (gameOver) {
            let i = 0;
            $coinArea.children().each(async function() {
                await sleep(++i * 2000);
                $(this).remove()
            })
        }
        $coinArea.off("click")
    }
    openFaucetWindow.open = !1;
    openFaucetWindow.firstRun = !0;
    openFaucetWindow.coinSize = 20;
    openFaucetWindow.interval = 100;
    openFaucetWindow.reward = 100;
    let selectionOn = !1;
    $wrapper.on("select mousedown mouseup", "*", function(e) {
        if ($(e.target).hasClass("window-mover"))
            return;
        selectionOn = !0
    });
    $(window).on("click keydown", function(e) {
        if (selectionOn) {
            selectionOn = !1;
            return
        }
        if (e.altKey || e.ctrlKey || e.shiftKey)
            return;
        $input.focus()
    });
    $input.on("input select keyup keydown change", function() {
        let val = $input.val();
        let start = $(this)[0].selectionStart;
        let end = $(this)[0].selectionEnd;
        end += (end == start) ? 1 : 0;
        $input_line.text(val);
        setCaretPosition();
        $input_caret.css({
            left: start + "ch",
            width: (end - start) + "ch",
        });
        $input_caret.text(val.substring(start, end));
        if (val.length > 0) {
            $input_caret.css({
                "animation-iteration-count": "0"
            })
        } else {
            $input_caret.css({
                "animation-iteration-count": "infinite"
            })
        }
        $(window).scrollTop($(document).height())
    });
    $input.on("keypress", function(e) {
        if (e.which == 13) {
            let input = $input_line.text();
            print((input ? input : "\r\n"), textTypes["input-text"], -1);
            $input.val("").trigger("change");
            $(document).trigger(events["input-received"], input)
        }
    });
    let tradeButtonMouseDownLoop = -1;
    $(document).on("mousedown", ".trade-button", function() {
        tradeProcessButtonPress(this);
        tradeButtonMouseDownLoop = setTimeout( () => {
            tradeButtonMouseDownLoop = setInterval( () => {
                tradeProcessButtonPress(this)
            }
            , 100)
        }
        , 500)
    });
    $(document).on("mouseup mouseout", ".trade-button", function() {
        clearTimeout(tradeButtonMouseDownLoop);
        clearInterval(tradeButtonMouseDownLoop)
    });
    $(document).on("mousedown", ".window-mover", function(e) {
        if (e.originalEvent.button == 0) {
            onDrag.x = e.clientX;
            onDrag.y = e.clientY;
            onDrag.target = $(e.target).data("move-target");
            document.onmousemove = onDrag;
            document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null
            }
            ;
            e.preventDefault()
        }
    });
    function onDrag(e) {
        e = e || window.event;
        e.preventDefault();
        let x = parseInt(onDrag.target.css("left")) - (onDrag.x - e.clientX);
        let y = parseInt(onDrag.target.css("top")) - (onDrag.y - e.clientY);
        x = clamp(onDrag.gutter + onDrag.target.outerWidth() / 2, $(window).innerWidth() - onDrag.target.outerWidth() / 2 - onDrag.gutter, x);
        y = clamp(onDrag.gutter + onDrag.target.outerHeight() / 2, $(window).innerHeight() - onDrag.target.outerHeight() / 2 - onDrag.gutter, y);
        onDrag.target.css({
            left: x,
            top: y,
        });
        onDrag.x = e.clientX;
        onDrag.y = e.clientY
    }
    onDrag.x = 0;
    onDrag.y = 0;
    onDrag.target = null;
    onDrag.gutter = 10;
    let floatingWindowLastIndex = 2;
    $(document).on("mousedown", ".floating-window", function(e) {
        $(this).css("z-index", ++floatingWindowLastIndex);
        if (floatingWindowLastIndex > 1000) {
            let indices = [];
            $(".floating-window").each(function() {
                indices.push(parseInt($(this).css("z-index")))
            });
            indices.sort( (a, b) => a - b);
            $(".floating-window").each(function() {
                $(this).css("z-index", indices.indexOf(parseInt($(this).css("z-index"))) + 2)
            });
            floatingWindowLastIndex = indices.length + 1
        }
    });
    function toEnum(obj) {
        for (let k of Object.keys(obj)) {
            obj[k] = k
        }
    }
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    function randomInt(x, y=0) {
        x = Math.floor(x);
        y = Math.ceil(y);
        if (y == 0) {
            return Math.floor(Math.random() * x)
        } else {
            return Math.floor(Math.random() * (y - x + 1)) + x
        }
    }
    function randomFloat(x, y=0) {
        if (y == 0) {
            return Math.random() * x
        } else {
            return Math.random() * (y - x) + x
        }
    }
    function clamp(min, max, val) {
        return Math.min(Math.max(val, min), max)
    }
    ;function millisToTime(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = Math.floor((millis % 60000) / 1000);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds
    }
    function debugPrint(text, type) {
        if (IS_DEBUG)
            print("DEBUG>> " + text, type, -1)
    }
    (async function() {
        {
            debugPrint(`---------------------------------------`, textTypes.warning, -1);
            debugPrint(`| Debug Mode on! Only for testing/dev |`, textTypes.warning, -1);
            debugPrint(`---------------------------------------`, textTypes.warning, -1)
        }
        $("#ei-msg").remove();
        if ($(window).width() < 720 || $(window).height() < 720) {
            print(`You're screen resolution is too small! It can result in unexpected visuals`, textTypes.warning, -1)
        }
        setupGame();
        if (!IS_DEBUG && !await welcome()) {
            print(`You failed the tutorial.`, textTypes.info);
            print(`Better luck next time`, textTypes.info);
            tutorialFailed();
            return
        }
        sleep(60000).then(async () => {
            let n = miscMarketItems.printSpeedUp.extras.maxQuantity;
            piaSays("Just a friendly advice. Upgrade your print speed asap!");
            await sleep(60000);
            while (n == miscMarketItems.printSpeedUp.extras.maxQuantity) {
                if (IS_DEBUG)
                    break;
                piaSays("Just listen to PIA's advice. Upgrade your print speed for a better experience!");
                await sleep(60000)
            }
        }
        );
        lateSetup();
        for (; ; ) {
            let menuPath = [];
            let input = [];
            if (menu.guiOpen) {
                await sleep(500);
                break
            }
            input = await menu(menuPath);
            if (input[1] == !1) {
                if (input[0] == menuActionType.back) {
                    piaSays(`That menu is your only way to interact for now. Don't exit it`)
                } else if (input[0] == menuActionType.invalid) {
                    piaSays(`You've already completed the tutorial. You should be able to use the menu better!`)
                } else if (input[0] == menuActionType.inGui) {}
            }
        }
    }
    )()
})
