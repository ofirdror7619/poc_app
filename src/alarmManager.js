const {CloudWatchClient, DescribeAlarmHistoryCommand} = require("@aws-sdk/client-cloudwatch");

async function getAlarmStateChangeTime(alarmName, daysToSearch = 1) {
    const cloudwatchClient = new CloudWatchClient({region: 'us-west-2'});
    try {
        const command = new DescribeAlarmHistoryCommand({
            AlarmName: alarmName,
            HistoryItemType: 'StateUpdate',
            StartDate: new Date(Date.now() - daysToSearch * 24 * 60 * 60 * 1000),
            EndDate: new Date() // Now
        });

        const data = await cloudwatchClient.send(command);
        const stateChangeEvents = data.AlarmHistoryItems;

        const breachTimes = new Set();
        for (const event of stateChangeEvents) {
            if (event.HistorySummary.includes("OK to ALARM")) {
                breachTimes.add(new Date(event.Timestamp).getTime());
            }
        }
        return Array.from(breachTimes).sort((a, b) => a - b);
    } catch (error) {
        console.error('Error:', error);
    }
    throw new Error(`No state change from OK to ALARM found for alarm: ${alarmName}`);
}

module.exports = {
    getAlarmStateChangeTime
};