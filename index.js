const {extractAgents} = require('./src/getErrorReport');
const {getAlarmStateChangeTime} = require('./src/alarmManager');
const {runLogInsightsQuery} = require('./src/logInsightManager');
const {searchErrorLogs} = require('./src/cloudWatchLogsManager');
const alarmObjectsMap = require('./src/alarmsObject');


async function searchErrors(alarmName, region) {
    const alarmObject = alarmObjectsMap[alarmName];
    alarmObject.alarmName = `${region}-${alarmName}`;
    const logGroupNames = alarmObject.logGroupNames.map(logGroupName => `/aws/lambda/${region}-${logGroupName}`);
    const queryString = alarmObject.query;
    let startTimeEndTimeSortedList = [];
    let failureReasons = [];
    try {
        const breachTimes = await getAlarmStateChangeTime(alarmObject.alarmName);
        console.log('Breach Times:', breachTimes);

        for (const breachTime of breachTimes) {
            const startTime = new Date(breachTime - 5 * 60 * 1000).getTime();
            const endTime = new Date(breachTime).getTime();
            startTimeEndTimeSortedList.push({
                startTime,
                endTime
            });
        }
        // let promises = startTimeEndTimeSortedList.map(async ({startTime, endTime}) => {
            // console.log('Start Time:', new Date(startTime), 'End Time:', new Date(endTime));
            // const errorLogs = await searchErrorLogs(logGroupName, startTime, endTime);
            // console.log('Error Logs:', errorLogs);
            // return extractAgents(errorLogs);
        // });

        // let agentsArrays = await Promise.all(promises);

        // agentsToSearchInQuery = [...new Set([].concat(...agentsArrays))];
        // console.log('Agents to search:', agentsToSearchInQuery);

        // for (const agent of agentsToSearchInQuery) {
            const queryResults = await runLogInsightsQuery(
                logGroupNames, queryString, startTimeEndTimeSortedList[0].startTime, startTimeEndTimeSortedList[startTimeEndTimeSortedList.length - 1].endTime);
            queryResults.map(result => failureReasons.push(result[0]));
            console.log(`Query Results for ${alarmName}:`, failureReasons);
        // }
        return {
            segments: failureReasons.map(agentResolutionReason => agentResolutionReason.value.replace(/"/g, '')),
            count: failureReasons.length
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = {
    main: searchErrors
};