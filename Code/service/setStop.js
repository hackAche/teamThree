const AWS = require('aws-sdk');
const STATE = require('./locale.json');
const fs = require('fs');

AWS.config.update({
  region: 'us-east-1'
})
async function register(stopInfo) {
  const stopID = stopInfo.stopID.toLowerCase().trim();
  const total = stopInfo.total;
  const macs = stopInfo.mac;
  if (!stopID || !destinos || !total) {
    return util.buildResponse(401, {
      message: "All fields are required"
    })
  }

  saveStopState(stopID, destinos, total, macs);
}
async function saveStopState(stopID, destinos, total, macs) {
  try {
    const data = fs.readFileSync(STATE, 'utf8');
    const streamData = JSON.parse(data);

    for (const mac in macs) {
      let local = checkMAC(mac);
      let destinosParse = streamData.stopID.destinos;
      destinosParse.local++;
    }
    streamData.stopID.destinos = destinos;
    streamData.stopID.total = total;
    fs.writeFileSync(STATE, JSON.stringify(streamData));
  } catch (err) {
    return util.buildResponse(403, { message: 'Error reading or writing file from disk' });
  }
}
async function checkMAC(mac) {
  const params = {
    TableName: 'macAddress',
    Key: {
      mac: mac
    }
  }
  return await dynamodb.get(params).promise().then(response => {
    if (response.item)
      return response.item.local;
    return false;
  }, error => {
    return util.buildResponse(403, { message: 'Error getting the user from db' });
  })
}
module.exports.register = register;