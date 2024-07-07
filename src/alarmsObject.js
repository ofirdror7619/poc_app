
metadataProducerWithoutMediaFiles = {
    query: "fields @message\n" +
        "| filter @message like 'was uploaded without screen nmf. SCREEN RECORDING WILL BE FILTERED'\n" +
        "| parse \"[*]\" as Segment\n" +
        "| display Segment",
    logGroupNames: ['lambda-applink-metadata-producer']
}

const alarmObjectsMap = {
    'metadata-producer-without-media-files': metadataProducerWithoutMediaFiles
}

module.exports = alarmObjectsMap;