# signal-ml-backend

This is the backend service for ![signal-ml](https://github.com/poohcom1/signal-ml). 
It is designed to be easily hosted by researchers to give musicians access to their virtual instruments.

## Setup

1. Clone this repository
2. Add instruments by creating folders in the model/ directory. 
   - The folder name should be the instrument name. 
   - Each folder should contain a YAML file called manifest.sml.yaml, which contains the configs and scripts for the model. See the ![schema](schemas/model_schema.json)
3. Host the ![frontend](https://github.com/poohcom1/signal-ml) and set its backend environment variable to the backend url.

## Planned features
 - Ability for frontend client to connect to multiple backends
 - Microservice based connections
