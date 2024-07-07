const {StartQueryCommand, GetQueryResultsCommand} = require("@aws-sdk/client-cloudwatch-logs");
const { CloudWatchLogsClient } = require("@aws-sdk/client-cloudwatch-logs");
const cloudwatchLogsClient = new CloudWatchLogsClient({ region: 'us-west-2' });

async function runLogInsightsQuery(logGroupNames, queryString, startTime, endTime) {
    const command = new StartQueryCommand({
        logGroupNames,
        queryString,
        startTime,
        endTime
    });

    const data = await cloudwatchLogsClient.send(command);
    const queryId = data.queryId;

    let queryStatus = 'Running';
    let queryResults;
    while (queryStatus === 'Running') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second

        const result = await cloudwatchLogsClient.send(new GetQueryResultsCommand({queryId}));
        queryStatus = result.status;

        if (queryStatus === 'Complete') {
            queryResults = result.results;
        } else if (queryStatus === 'Failed') {
            throw new Error("Log Insights query failed.");
        }
    }
    return queryResults;
}

module.exports = {
    runLogInsightsQuery
};