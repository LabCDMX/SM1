## ASTUS API

This API was created to receive ASTUS GPS data of the SM1 buses. 
It was made serverless by using AWS services: 

- Api Gateway
- Kinesis
- S3

### Configuration

The detailed architecture is shown in [docs/architecture.md](../docs/architecture.md), and from there, we will only consider the reception of GPS information from ASTUS. 
For that purpuse, we will expose a REST endpoint via Api Gateway. Such endpoint will be backed by a Kinesis Stream and a Firehose Delivery Stream attached to it so the data is sent to an S3 bucket.

The process should be something like the followint:

1. Create an S3 bucket to store all received data (ie _astus-data_)
2. Create a Kinesis Stream (ie _astus-stream_)
3. Create a Kinesis Firehose Delivery Stream and attach the stream from the previous step as source , and the bucket as destination
4. Now let's configure the API using Api Gateway. For that, we provide the following files:

    - apigateway-wawa-prod-swagger.json: [swagger](https://swagger.io/) contract of this exposed API
    - apigateway-request-mapping.vm: [velocity](http://velocity.apache.org/) template to map from ASTUS requests to Kinesis Streams requests
    - apigateway-response-mapping.vm: [velocity](http://velocity.apache.org/) template to map from Kinesis Streams to the API responses
    - apigateway-BusLastStateReq-schema.json: json schema of the expected request (made by ASTUS) to this exposed API
    - apigateway-request-example.json: example of a request made by ASTUS to this exposed API

    a) Create a new API from a swagger file and select apigateway-wawa-prod-swagger.json (modify accordingly)

    b) Configure the resource **/api/nrt/bus-position POST** by setting the integration request mapping with apigateway-request-mapping.vm file

    c) Configure the resource **/api/nrt/bus-position POST** by setting the integration response mapping with apigateway-response-mapping.vm file

    d) Create the **prod** deployment of the API

    e) Create an **usage plan** and **api key** for astus, and associate it to a deployment stage

    
