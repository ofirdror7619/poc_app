const {getAlarmStateChangeTime} = require('./src/alarmManager');
const {runLogInsightsQuery} = require('./src/logInsightManager');
const alarmObjectsMap = require('./src/alarmsObject');

async function searchErrors(alarmName, region, daysToSearch) {
    const alarmObject = alarmObjectsMap[alarmName];
    alarmObject.alarmName = `${region}-${alarmName}`;
    const logGroupNames = alarmObject.logGroupNames.map(logGroupName => `/aws/lambda/${region}-${logGroupName}`);
    const queryString = alarmObject.query;
    try {
        const {searchStartTime, searchEndTime} = await getAlarmStateChangeTime(alarmObject.alarmName, daysToSearch);

        console.log('first breach time: ', searchStartTime, "last breach time: ", searchEndTime);

        let queryResults = await runLogInsightsQuery(logGroupNames, queryString, searchStartTime, searchEndTime);
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