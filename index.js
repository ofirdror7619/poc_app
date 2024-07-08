const {extractAgents} = require('./src/getErrorReport');
const {getAlarmStateChangeTime} = require('./src/alarmManager');
const {runLogInsightsQuery} = require('./src/logInsightManager');
const {searchErrorLogs} = require('./src/cloudWatchLogsManager');
const alarmObjectsMap = require('./src/alarmsObject');
const minutesToLookBack = 5;

async function searchErrors(alarmName, region) {
    const alarmObject = alarmObjectsMap[alarmName];
    alarmObject.alarmName = `${region}-${alarmName}`;
    const logGroupNames = alarmObject.logGroupNames.map(logGroupName => `/aws/lambda/${region}-${logGroupName}`);
    const queryString = alarmObject.query;
    let startTimeEndTimeSortedList = [];
    try {
        const breachTimes = await getAlarmStateChangeTime(alarmObject.alarmName);
        console.log('Breach Times:', breachTimes);

        for (const breachTime of breachTimes) {
            const startTime = new Date(breachTime - minutesToLookBack * 60 * 1000).getTime();
            const endTime = new Date(breachTime).getTime();
            startTimeEndTimeSortedList.push({
                startTime,
                endTime
            });
        }

            let queryResults = await runLogInsightsQuery(
                logGroupNames, queryString, startTimeEndTimeSortedList[0].startTime, startTimeEndTimeSortedList[startTimeEndTimeSortedList.length - 1].endTime);
            queryResults = queryResults.map(result => result[0]);
            console.log(`Query Results for ${alarmName}:`, queryResults);
        
            const result = alarmObject.createResult(queryResults);
            return {
                result: result
            };        

    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = {
    main: searchErrors
};