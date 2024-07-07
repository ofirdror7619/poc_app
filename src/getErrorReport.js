function extractAgents(logs) {
    const agentRegex = /agents:\s*\[([^\]]+)\]/;
    const agents = [];
    logs.forEach(log => {
        const match = log.message.match(agentRegex);
        if (match) {
            match[1].split(',').map(agent => agents.push(agent.trim()));
        }
    });
    return agents;
}

module.exports = {
    extractAgents
};