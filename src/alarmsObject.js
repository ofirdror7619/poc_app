
metadataProducerWithoutMediaFiles = {
    query: "fields @message\n" +
        "| filter @message like 'was uploaded without screen nmf. SCREEN RECORDING WILL BE FILTERED'\n" +
        "| parse \"[*]\" as Segment\n" +
        "| display Segment",
    logGroupNames: ['lambda-applink-metadata-producer'],
    createResult: (queryResults) => {
        return {
            title: queryResults?.length > 0 ? queryResults[0].field : 'no results found',
            values: queryResults.map(item => item.value.replace(/"/g, ''))
        }
    }
}

metadataProducerOsLoginNotFound = {
    query: "fields @message\n" +
        "| filter @message like 'ERROR	Some of the interaction will not be processed because of user resolution failure, for the following agents:'\n" +
        "| parse @message 'the following agents: [*]' as agentIds\n" +
        "| display agentIds",
    logGroupNames: ['lambda-applink-metadata-producer'],
    createResult: (queryResults) => {
        return {
            title: queryResults?.length > 0 ? queryResults[0].field : 'no results found',
            values: Array.from(new Set(queryResults.map(obj => obj.value.toString().split(",")).flatMap(userIds => userIds)))
        }
    }
}

const alarmObjectsMap = {
    'metadata-producer-without-media-files': metadataProducerWithoutMediaFiles,
    'metadata-producer-osLogin-not-found': metadataProducerOsLoginNotFound
}

module.exports = alarmObjectsMap;