const util = require('./util/util')
const setBusService = require('./service/setBus');
const setStopService = require('./service/setStop');

const setBusPath = '/setbus';
const setStopPath = '/setstop';
const healthPath = '/health';

exports.handler = async (event) => {
  console.log("Request event: ", event);
  let response;
  switch (true) {
    case event.httpMethod === 'GET' && event.path === healthPath:
      response = util.buildResponse(200);
      break;
    case event.httpMethod === 'POST' && event.path === setBusPath:
      const setBusBody = JSON.parse(event.body);
      response = await (setBusService.register(setBusBody));
      break;
    case event.httpMethod === 'POST' && event.path === setStopPath:
      const setStopBody = JSON.parse(event.body);
      response = await (setStopService.register(setStopBody));
      break;
    default:
      response = util.buildResponse(404, '404 Not Found');
  }
  return response;
};