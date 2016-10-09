'use strict';

class EventConstantInputs {
    constructor(serverless, options) {

        // read inputs from function events
        let inputs = [];
        for (let functionName of Object.keys(serverless.service.functions)) {
            let eventId = 0;
            for (let event of serverless.service.functions[functionName].events) {
                if (event.schedule) {
                    eventId ++;
                    if (event.schedule.input) {
                        inputs[inputs.length] = {
                            name: functionName,
                            eventId: eventId,
                            field: typeof event.schedule.input === 'string' ? event.schedule.input : JSON.stringify(event.schedule.input)
                        };
                    }
                }
            }
        }

        // make sure resources exist
        if (!serverless.service.resources) {
            serverless.service.resources = {};
        }
        if (!serverless.service.resources.Resources) {
            serverless.service.resources.Resources = {};
        }

        // adds the fields to the resources
        for (let input of inputs) {
            const name = input.name.replace(/\b[a-z]/g, f => f.toUpperCase()) + 'EventsRuleSchedule' + input.eventId;
            serverless.service.resources.Resources[name] = {
                Properties: {
                    Targets: [
                        {
                            Input: input.field
                        }
                    ]
                }
            };
        }

        this.serverless = serverless;
    }
}

module.exports = EventConstantInputs;
