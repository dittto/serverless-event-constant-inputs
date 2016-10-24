'use strict';

const expect = require('chai').expect;
const EventConstantInputs = require('../index');

describe('serverless-event-constant-inputs', function () {
    it('Should accept inputs that are arrays', function () {
        // init config
        const config = {
            function_1: {
                events: []
            }
        };
        config.function_1.events[0] = {
            schedule: {
                input: {
                    data_1: 'one',
                    data_2: 2,
                    data_3: [3, 4, 5],
                    data_6: {one: 1, two: 'two'}
                }
            }
        };

        // get the parsed input
        const inputs = new EventConstantInputs({}, []);
        const result = inputs.getInputsFromConfig(config);

        expect(result).to.have.length(1);
        expect(result[0].name).to.equal('function_1');
        expect(result[0].eventId).to.equal(1);
        expect(result[0].field).to.equal(JSON.stringify(config.function_1.events[0].schedule.input));
    });

    it('Should accept inputs that are strings', function () {
        // init config
        const config = {
            function_1: {
                events: []
            }
        };
        config.function_1.events[0] = {
            schedule: {
                input: '{"test_one": "two"}'
            }
        };

        // get the parsed input
        const inputs = new EventConstantInputs({}, []);
        const result = inputs.getInputsFromConfig(config);

        expect(result).to.have.length(1);
        expect(result[0].name).to.equal('function_1');
        expect(result[0].eventId).to.equal(1);
        expect(result[0].field).to.equal(config.function_1.events[0].schedule.input);
    });

    it('Can handle no inputs', function () {
        // init config
        const config = {
            function_1: {
                events: []
            }
        };
        config.function_1.events[0] = {
            schedule: {
                rate: 'cron(0 1 * * ? *)'
            }
        };

        // get the parsed input
        const inputs = new EventConstantInputs({}, []);
        const result = inputs.getInputsFromConfig(config);

        expect(result).to.have.length(0);
    });

    it('Can handle empty event inputs mixed with data', function () {
        // init config
        const config = {
            function_1: {
                events: []
            }
        };
        config.function_1.events[0] = {
            schedule: {
                rate: 'cron(0 1 * * ? *)',
                input: '{"test_one": "two"}'
            }
        };
        config.function_1.events[1] = {
            schedule: {
                rate: 'cron(0 2 * * ? *)'
            }
        };
        config.function_1.events[2] = {
            schedule: {
                rate: 'cron(0 3 * * ? *)',
                input: '{"test_three": "four"}'
            }
        };

        // get the parsed input
        const inputs = new EventConstantInputs({}, []);
        const result = inputs.getInputsFromConfig(config);

        expect(result).to.have.length(2);
        expect(result[0].name).to.equal('function_1');
        expect(result[0].eventId).to.equal(1);
        expect(result[0].field).to.equal(config.function_1.events[0].schedule.input);
        expect(result[1].name).to.equal('function_1');
        expect(result[1].eventId).to.equal(3);
        expect(result[1].field).to.equal(config.function_1.events[2].schedule.input);
    });

    it('Can handle multiple functions', function () {
        // init config
        const config = {
            function_1: {
                events: []
            },
            function_2: {
                events: []
            }
        };
        config.function_1.events[0] = {
            schedule: {
                rate: 'cron(0 1 * * ? *)',
                input: '{"test_one": "two"}'
            }
        };
        config.function_2.events[0] = {
            schedule: {
                rate: 'cron(0 2 * * ? *)'
            }
        };
        config.function_2.events[1] = {
            schedule: {
                rate: 'cron(0 3 * * ? *)',
                input: '{"test_three": "four"}'
            }
        };

        // get the parsed input
        const inputs = new EventConstantInputs({}, []);
        const result = inputs.getInputsFromConfig(config);

        expect(result).to.have.length(2);
        expect(result[0].name).to.equal('function_1');
        expect(result[0].eventId).to.equal(1);
        expect(result[0].field).to.equal(config.function_1.events[0].schedule.input);
        expect(result[1].name).to.equal('function_2');
        expect(result[1].eventId).to.equal(2);
        expect(result[1].field).to.equal(config.function_2.events[1].schedule.input);
    });

    it('Checks the output resources are generated if missing', function () {
        // init config
        const config = {
            service: {
                functions: {
                    function_1: {
                        events: []
                    }
                }
            }
        };
        const inputs = new EventConstantInputs(config, []);
        expect(inputs.serverless.service.resources).to.have.property('Resources');
        expect(inputs.serverless.service.resources.Resources).to.be.empty;
    });

    it('Updates the serverless variable with no existing data', function () {
        // init config
        const config = {
            service: {
                functions: {
                    function_1: {
                        events: []
                    }
                }
            }
        };
        config.service.functions.function_1.events[0] = {
            schedule: {
                rate: 'cron(0 1 * * ? *)',
                input: '{"test_one": "two"}'
            }
        };
        config.service.functions.function_1.events[1] = {
            schedule: {
                rate: 'cron(0 2 * * ? *)'
            }
        };
        config.service.functions.function_1.events[2] = {
            schedule: {
                rate: 'cron(0 3 * * ? *)',
                input: '{"test_three": "four"}'
            }
        };

        // get the parsed input
        const inputs = new EventConstantInputs(config, []);
        expect(inputs.serverless.service.resources.Resources).has.property('Function_1EventsRuleSchedule1');
        expect(inputs.serverless.service.resources.Resources).has.property('Function_1EventsRuleSchedule3');
        expect(inputs.serverless.service.resources.Resources['Function_1EventsRuleSchedule1'].Properties.Targets[0].Input).to.be.equal('{"test_one": "two"}');
        expect(inputs.serverless.service.resources.Resources['Function_1EventsRuleSchedule3'].Properties.Targets[0].Input).to.be.equal('{"test_three": "four"}');
    });

    it('Updates the serverless variable with existing data', function () {
        // init config
        const config = {
            service: {
                functions: {
                    function_1: {
                        events: []
                    }
                },
                resources: {
                    Resources: {}
                }
            }
        };
        config.service.functions.function_1.events[0] = {
            schedule: {
                rate: 'cron(0 1 * * ? *)',
                input: '{"test_one": "two"}'
            }
        };
        config.service.functions.function_1.events[1] = {
        };
        config.service.functions.function_1.events[2] = {
            schedule: {
                rate: 'cron(0 3 * * ? *)',
                input: '{"test_three": "four"}'
            }
        };

        // get the parsed input
        const inputs = new EventConstantInputs(config, []);
        expect(inputs.serverless.service.resources.Resources).has.property('Function_1EventsRuleSchedule1');
        expect(inputs.serverless.service.resources.Resources).has.property('Function_1EventsRuleSchedule2');
        expect(inputs.serverless.service.resources.Resources['Function_1EventsRuleSchedule1'].Properties.Targets[0].Input).to.be.equal('{"test_one": "two"}');
        expect(inputs.serverless.service.resources.Resources['Function_1EventsRuleSchedule2'].Properties.Targets[0].Input).to.be.equal('{"test_three": "four"}');
    });
});
