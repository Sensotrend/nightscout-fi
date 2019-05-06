let sample = [{
      "device": "MDT-554"
      , "created_at": "2019-02-14T13:30:50.509+0200"
      , "type": "Bolus"
      , "carbs": 15
      , "insulin": 1.5
}
];

function getRandomInt (min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min + 1)) + min;
}

let d = new Date();

sample[0].created_at = d.toISOString();

console.log(JSON.stringify(sample));
