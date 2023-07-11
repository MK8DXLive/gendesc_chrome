window.onload = async function() {
    const selected = readLocalStorage('selected_recorder');

    Promise.all([selected]).then(values => {
        if (values[0]) {
            recorder = values[0];
        }
        main();
        console.log(recordList.slice(-1)[0].printDesc());
    });
}

function copy_from_textarea() {
    const TEXT = recordList.slice(-1)[0].printDesc();
    navigator.clipboard.writeText(TEXT).then(e => {
        alert('Description has been copied.\n(Recorder: ' + recorder + ')');
    });
}

function main() {
    const TEXT = parseAllText()
    console.log(TEXT)
    parseText(TEXT);
    outputDesc();
    copy_from_textarea();
}

const readLocalStorage = async(key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function(items) {
            if (items[key] === undefined) {
                reject();
            } else {
                resolve(items[key]);
            }
        });
    });
};


var recorder = "MK8DXRecords Staff"
var recordList = [];

function parseAllText() {
    const SRC = document.body.innerHTML.trim().split(/\n/);
    p = 0
    track = "Mario Circuit"
    while (p < SRC.length) {
        if (SRC[p].trim().startsWith("<h2>")) {
            track = SRC[p].trim().match(/<h2>(.*)<\/h2>/)[1]
            p = 0
            break
        }
        p = p + 1
    }

    cnvText = ""
    var p = 1
    var startIndex = 0
    var endIndex = SRC.length
    while (SRC.length - p >= 0) {
        if (SRC[SRC.length - p].trim() == "</tr>") {
            endIndex = SRC.length - p
            var q = 1
            var trCounter = 0
            while (SRC.length - p - q >= 0) {
                if (SRC[SRC.length - p - q].trim() == "<tr>") {
                    trCounter = trCounter + 1
                    if (trCounter == 2 && track != "GCN Baby Park") {
                        startIndex = SRC.length - p - q
                        for (var p = startIndex; p <= endIndex; p++) {
                            cnvText = cnvText + SRC[p] + "\n"
                        }
                        break
                    } else if (trCounter == 4 && track == "GCN Baby Park") {
                        startIndex = SRC.length - p - q
                        for (var p = startIndex; p <= endIndex; p++) {
                            cnvText = cnvText + SRC[p] + "\n"
                        }
                        break
                    }
                }
                q = q + 1
            }
            break
        }
        p = p + 1
    }
    return cnvText
}

function parseText(s) {
    const SRC = s.trim().split(/\n/);
    var ele = [];
    recordList = [];
    var q = 0;
    var readMode = false;
    for (var p = 0; p < SRC.length; p++) {
        if (SRC[p].trim() == "<tr>") {
            if (ele.length == 0) {
                q = 0;
                readMode = true;
            }
        } else if (SRC[p].trim().match(/^<\/tr>/)) {
            if (ele.length == 14) {
                var rec = new Record(ele[0], ele[1], ele[2], ele[3], ele[5], ele[6], ele[7], ele[8], ele[9], ele[10], ele[11], ele[12], ele[13]);
                recordList.push(rec);
                readMode = false;
                ele = [];
            } else if (ele.length == 15) {
                //continue
            } else if (ele.length == 18) {
                var rec = new BabyParkRecord(ele[0], ele[1], ele[2], ele[3], ele[5], ele[6], ele[7], ele[8], ele[9], ele[10], ele[11], ele[12], ele[15], ele[13], ele[14], ele[16], ele[17]);
                recordList.push(rec);
                readMode = false;
                ele = [];
            }
        } else if (readMode) {
            if (q == 1) {
                if (SRC[p].trim().match(/<td.*><a .+>.+<\/a>.*<\/td>/)) {
                    if (SRC[p].trim().match(/<td.*><a .+>.+<\/a> <img.*><\/td>/)) {
                        ele.push(SRC[p].trim().match(/<td.*><a .+>(.+)<\/a> <img.*><\/td>/)[1]);
                    } else {
                        ele.push(SRC[p].trim().match(/<td.*><a .+>(.+)<\/a><\/td>/)[1]);
                    }
                } else {
                    if (SRC[p].trim().match(/<td.*>(.+) <img.*><\/td>/)) {
                        ele.push(SRC[p].trim().match(/<td.*>(.+) <img.*><\/td>/)[1]);
                    } else {
                        ele.push(SRC[p].trim().match(/<td.*>(.+)<\/td>/)[1]);
                    }
                }
            } else if (q == 2) {
                if (SRC[p].trim().match(/<td.*><a .+>.+<\/a><\/td>/)) {
                    ele.push(SRC[p].trim().match(/<td.*><a .+>(.+)<\/a><\/td>/)[1]);
                } else {
                    ele.push(SRC[p].trim().match(/<td.*>(.+)<\/td>/)[1]);
                }
            } else if (q == 3) {
                ele.push(SRC[p].trim().match(/<td.*><center><img alt\s*=\s*\"(.+)\" title.+><\/center><\/td>/)[1]);
            } else { // q(=column)=0,4,5,6...
                if (SRC[p].trim().match(/<td.*>.+<a .+>.+<\/a><\/td>/)) { // including star icon
                    ele.push(SRC[p].trim().match(/<td.*>(.+)<a .+>.+<\/a><\/td>/)[1]);
                } else {
                    ele.push(SRC[p].trim().match(/<td.*>(.+)<\/td>/)[1]);
                }
            }
            q++;
        }
    }
}

function outputDesc() {
    recordList.slice(-1)[0].setPrevious(recordList[0]);
}

class Record {
    constructor(a, b, c, d, e, f, g, h, i, j, k, l, m) {
        this.date = new Date(a);
        this.time = b.split(/'|"/).map(Number);
        this.player = c;
        this.nation = d;
        this.lap1 = e;
        this.lap2 = f;
        this.lap3 = g;
        this.coin = h.split('-');
        this.shroom = i.split('-');
        this.driver = j.trim();
        this.vehicle = k.trim();
        this.tires = l.trim();
        this.glider = m.trim();
        this.previousDate = null;
        this.previousTime = [9, 59, 999];
        this.previousPlayer = "unknown";
        this.previousDays = 0;
        this.diff = 0;
    }
    cnvTime(tm) {
        return (tm[0] * 60 + tm[1]) * 1000 + tm[2]
    }
    printTime(tm) {
        return ("0" + tm[0]).slice(-1) + ":" + ("00" + tm[1]).slice(-2) + "." + ("000" + tm[2]).slice(-3);
    }
    printDate(dt) {
        function suffix(x) {
            var y = x % 10,
                z = x % 100;
            if (y == 1 && z != 11) {
                return x + "st";
            }
            if (y == 2 && z != 12) {
                return x + "nd";
            }
            if (y == 3 && z != 13) {
                return x + "rd";
            }
            return x + "th";
        }

        const months = ["January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
        var month = months[dt.getMonth()];
        var day = dt.getUTCDate();
        var year = dt.getFullYear();
        return month + " " + suffix(day) + ", " + year;
    }
    printLap() {
        return this.lap1 + " - " + this.lap2 + " - " + this.lap3
    }
    printCoin() {
        var coins = "";
        for (const sec of this.coin) {
            coins = coins + sec + " - ";
        }
        return coins.slice(0, -3);
    }
    printShroom() {
        var shrooms = "";
        for (const sec of this.shroom) {
            shrooms = shrooms + sec + " - ";
        }
        return shrooms.slice(0, -3);
    }
    printDesc() {
        var desc = `Date: ${this.printDate(this.date)}
${this.diff} improvement over previous WR: ${this.printTime(this.previousTime)} by ${this.previousPlayer} on ${this.previousDate}${this.previousDays}

Combo: ${this.driver} / ${this.vehicle} / ${this.tires} / ${this.glider}
Splits: ${this.printLap()}
Mushrooms: ${this.printShroom()}
Coins: ${this.printCoin()}

Player's WR profile: https://mkwrs.com/mk8dx/profile.php?player=${this.player.replace(/ /g,"%20")}

See all the current and past WRs for MK8DX at : https://mkwrs.com/mk8dx
See various top 10 leaderboards for MK8DX at : http://mkleaderboards.com/
Discuss Time Trials in the MKLeaderboards Discord server! : https://discord.gg/NHrtWQq

Enter the MK8DX time trial competition at : http://www.mariokartplayers.com/mk8
Join the MK8DX online competitive scene at : http://www.mariokartcentral.com/

If you want to watch WR videos for the Wii U version of MK8, refer to: https://www.youtube.com/user/MK8Records

Recorded by ${recorder}`;
        return desc;
    }
    setPrevious(rec) {
        this.previousDate = rec.date;
        var last = (this.date - this.previousDate) / 86400000;
        if (last > 1) {
            this.previousDate = this.printDate(this.previousDate);
            this.previousDays = " (lasted " + last + " days)";
        } else if (last == 1) {
            this.previousDate = this.printDate(this.previousDate);
            this.previousDays = " (lasted " + last + " day)";
        } else if (this.previousDays == 0) {
            this.previousDate = "the same day"
            this.previousDays = "";
        } else {
            this.previousDays = " (?)";
        }
        this.previousTime = rec.time;
        var diff = this.cnvTime(this.previousTime) - this.cnvTime(this.time);
        this.diff = parseInt(diff / 1000, 10) + "." + ("000" + diff % 1000).slice(-3);
        this.previousPlayer = (this.player == rec.player ? "the same player" : rec.player);
    }

}

class BabyParkRecord extends Record {
    constructor(a, b, c, d, l1, l2, l3, l4, l5, l6, l7, h, i, j, k, l, m) {
        super(null, "0\'00\"000", null, null, null, null, null, "0-0-0", "0-0-0", "", "", "", "");
        this.date = new Date(a);
        this.time = b.split(/'|"/).map(Number);
        this.player = c;
        this.nation = d;
        this.lap1 = l1;
        this.lap2 = l2;
        this.lap3 = l3;
        this.lap4 = l4;
        this.lap5 = l5;
        this.lap6 = l6;
        this.lap7 = l7;
        this.coin = h.split('-');
        this.shroom = i.split('-');
        this.driver = j.trim();
        this.vehicle = k.trim();
        this.tires = l.trim();
        this.glider = m.trim();
        this.previousDate = null;
        this.previousTime = [9, 59, 999];
        this.previousPlayer = "unknown";
        this.previousDays = 0;
        this.diff = 0;
    }
    printLap() {
        return this.lap1 + " - " + this.lap2 + " - " + this.lap3 + " - " + this.lap4 + " - " + this.lap5 + " - " + this.lap6 + " - " + this.lap7
    }
}