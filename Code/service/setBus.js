const AWS = require('aws-sdk');
const STATE = require('./locale.json');
const fs = require('fs');

AWS.config.update({
    region: 'us-east-1'
})
async function register(busInfo){
    const busID = busInfo.busID.toLowerCase().trim();
    const totalNumber = busInfo.totalNumber;
    if (!busID || !totalNumber){
        return util.buildResponse(401, {
            message: "All fields are required"
        })
    }
    saveBusState(busID, totalNumber);
    return util.buildResponse(200, { message: 'Bus saved' });
}

async function saveBusState(busID, totalNumber){
  try {
    const data = fs.readFileSync(STATE, 'utf8');
    const streamData = JSON.parse(data);
    streamData.busID.lotacao = totalNumber;
    fs.writeFileSync(STATE, JSON.stringify(streamData));
  }catch (err) {
    return util.buildResponse(403, { message: 'Error reading or writing file from disk' });
  }
}

module.exports.register = register;