#!/bin/bash
pip install -r requirements.txt -t modules
cp aws-panda-numpy/lambda.zip .
cd modules
zip -ur ../lambda.zip *
cd ..
cd src
zip -ur ../lambda.zip *
cd ..
#aws s3 cp lambda.zip s3://datank-wawa/lambda/lambda.zip
aws lambda update-function-code --function-name wawa  --zip-file fileb://lambda.zip 
