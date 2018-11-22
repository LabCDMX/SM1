#!/bin/bash
pip install -r requirements.txt -t modules
cd modules
zip -ur ../lambda.zip *
cd ..
cd src
zip -ur ../lambda.zip *
cd ..
aws lambda update-function-code --function-name wawaCleanHistory  --zip-file fileb://lambda.zip 
