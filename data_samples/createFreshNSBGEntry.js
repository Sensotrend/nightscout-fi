
let sample = 
[{"_id":"5c655105763fe276981ff0c2",
"device":"xDrip-DexcomG5",
"date":1550143850509,
"dateString":"2019-02-14T13:30:50.509+0200",
"sgv":100,
"type":"sgv",
"filtered":195071.0394182456,
"unfiltered":196842.65552921052,
"rssi":100,
"noise":1
}
];

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let d = new Date();

sample[0].date = d.getTime();
sample[0].dateString = d.toISOString();
sample[0].sgv = sample[0].sgv + getRandomInt(1,10);

console.log(JSON.stringify(sample));
