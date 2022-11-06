const AWS = require('aws-sdk');
const filePath = '../service/data.json';
const file = require(filePath);
const util = require('../util/util');

AWS.config.update({
    region: 'us-east-1'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
async function register(stopInfo){
    const id = stopInfo.parada;
    const totalNumber = stopInfo.total;
    const macs = stopInfo.macs;
    let realNumber = 0;
    if (!id || !totalNumber){
        return util.buildResponse(401, {
            message: "All fields are required"
        });
    }
    try{
        for (let index = 0; index < totalNumber; index++) {
            if (file[macs[index]])
                realNumber++;
        }
    }catch (err){
        console.error('There is an error couting the stop: ', err);
    }
    const stop = {
        "type":"stop",
        "name":id,
        "total": realNumber
    };
    const saveBus = await saveStopState(stop);
    if(!saveBus){
        return util.buildResponse(503, {message: "Server Error. Please try again later."});
    }
    return util.buildResponse(200, {message: "saved"});
}
async function saveStopState(stop){
    const params = {
        TableName: "hackathon",
        Item: stop
    };
    return await dynamodb.put(params).promise().then(() => {
        return true;    
    }, error=> {
        console.error('There is an error saving stop: ', error);
    });
}

module.exports.register = register;