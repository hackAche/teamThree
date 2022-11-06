const AWS = require('aws-sdk');
const util = require('../util/util');

AWS.config.update({
    region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();

const SES = new AWS.SES({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_KEY,
    region: 'us-east-1',
  });

async function register(busInfo){
    const busID = busInfo.busID.toLowerCase().trim();
    const totalNumber = busInfo.totalNumber;
    const max = busInfo.max;
    if (!busID || !totalNumber){
        return util.buildResponse(401, {
            message: "All fields are required"
        });
    }
    const bus = {
        "type":"bus",
        "name":busID,
        "lotacao": totalNumber,
        "max": max
    };
    const saveBus = await saveBusState(bus);
    if(!saveBus){
        return util.buildResponse(503, {message: "Server Error. Please try again later."});
    }
    let stop = await getStop(busID);
    if(!stop){
        return util.buildResponse(503, {message: "Server Error. Please try again later. Getting item"});
    }
    if(stop.total + totalNumber > max){
        const sended = await sendTestEmail('gustavo.pinzon55@gmail.com', 'envie um onibus para a parada ' + busID, 'Envie mais onibus');
        if (!sended) {
            return util.buildResponse(503, {message: "Failed to send email"});
        }
        return util.buildResponse(200, {message: "Send 1 more bus to the " + busID});
    }
    return util.buildResponse(200, {message: "Saved to the database"});
}
async function saveBusState(bus){
    const params = {
        TableName: "hackathon",
        Item: bus
    };
    return await dynamodb.put(params).promise().then(() => {
        return true;    
    }, error=> {
        console.error('There is an error saving bus: ', error);
    });
}
async function getStop(name) {
    const params = {
        TableName: "hackathon",
        Key: {
            type: "stop",
            name: name
        }
    };
    return await dynamodb.get(params).promise().then(response => {
        return response.Item;    
    }, error=> {
        console.error('There is an error getting the info: ', error);
    });
}
async function sendTestEmail(to, message, title) {
    const from = '<gustavo.pinzon55@gmail.com>';
    const params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: '<p>' + message + '</p>',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: title,
        },
      },
      Source: from,
    };
  
    try {
      await SES.sendEmail(params).promise();
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
module.exports.register = register;