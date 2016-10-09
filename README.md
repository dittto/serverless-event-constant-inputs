# Serverless event constant inputs

Allows you to add constant inputs to events in Serverless 1.0. This is defined in https://aws.amazon.com/blogs/compute/simply-serverless-use-constant-values-in-cloudwatch-event-triggered-lambda-functions/ .


## How to use

Add either a simple string as an input field to an event schedule, or an object.

```
functions:
  esi:
    handler: handler.esi
    events:
      - http:
          method: GET
          path: pages/{path+}
      - schedule:
          rate: cron(0 1 * * ? *)
          enabled: true
          input:
            provider: stubhub
            is_delta: true
      - schedule:
          rate: cron(0 2 * * ? *)
          enabled: true
          input: '{"provider": "see_tickets"}'
```

The above shows adding input values to 2 scheduled events. The first as an object and the second as a string.

## TODO

- Add tests
- Add linting
- Setup Travis
- Publish to NPM
