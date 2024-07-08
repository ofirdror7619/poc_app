const {CloudWatchClient, DescribeAlarmHistoryCommand} = require("@aws-sdk/client-cloudwatch");
const minutesToLookBack = 5;

function createStartTimeEndTimeObject(breachTime) {
    const startTime = new Date(breachTime - minutesToLookBack * 60 * 1000).getTime();
    const endTime = new Date(breachTime).getTime();
    return {startTime, endTime};
}

async function getAlarmStateChangeTime(alarmName, startDate) {
    const cloudwatchClient = new CloudWatchClient({region: 'us-west-2'});
    try {
        if (isNaN(Date.parse(startDate))) {
            throw new Error(`Invalid startDate: ${startDate}`);
        }
        const command = new DescribeAlarmHistoryCommand({
            AlarmName: alarmName,
            HistoryItemType: 'StateUpdate',
            StartDate: new Date(startDate), // Create a new Date object from the startDate string
            EndDate: new Date()
        });

        const data = await cloudwatchClient.send(command);
        const stateChangeEvents = data.AlarmHistoryItems;

        const breachTimes = new Set();
        for (const event of stateChangeEvents) {
            if (event.HistorySummary.includes("OK to ALARM")) {
                breachTimes.add(new Date(event.Timestamp).getTime());
            }
        }
        console.log('breachTimes:', breachTimes);
        const sortedBreachTimeList = Array.from(breachTimes).sort((a, b) => a - b);

        return {
            searchStartTime: createStartTimeEndTimeObject(sortedBreachTimeList[0]).startTime,
            searchEndTime: createStartTimeEndTimeObject(sortedBreachTimeList[sortedBreachTimeList.length - 1]).endTime
        }
    } catch (error) {
        console.error('Error:', error);
    }
    throw new Error(`No state change from OK to ALARM found for alarm: ${alarmName}`);
}

module.exports = {
    getAlarmStateChangeTime
};