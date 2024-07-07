const {CloudWatchLogsClient, FilterLogEventsCommand} = require("@aws-sdk/client-cloudwatch-logs");

const cloudwatchLogsClient = new CloudWatchLogsClient({region: 'us-west-2'});

async function searchErrorLogs(logGroupName, startTime, endTime) {
    const command = new FilterLogEventsCommand({
        logGroupName,
        startTime,
        endTime,
        filterPattern: '"Some of the interaction will not be processed because of user resolution failure"'
    });
    const data = await cloudwatchLogsClient.send(command);
    return data.events;
}

module.exports = {
    searchErrorLogs
};